<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentChunk;
use App\Models\Project;
use App\Models\TokenUsage;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class LodexService
{
    protected DocumentParserService $parser;
    protected int $localDimension = 384;

    public function __construct(?DocumentParserService $parser = null)
    {
        $this->parser = $parser ?? new DocumentParserService();
    }

    /**
     * Resolve the active Project (Tenant) from either a User or a Sanctum-authenticated Project.
     */
    protected function resolveProject(User|Project|null $actor = null): ?Project
    {
        if ($actor instanceof Project) {
            return $actor;
        }

        if ($actor instanceof User) {
            return $actor->currentProject ?? Project::where('user_id', $actor->id)->first();
        }

        $authUser = auth()->user();
        if ($authUser instanceof Project) {
            return $authUser;
        }
        if ($authUser instanceof User) {
            return $authUser->currentProject ?? Project::where('user_id', $authUser->id)->first();
        }

        return null;
    }

    /**
     * Ingest raw JSON text document directly into the tenant's isolated partition in Laravel DB.
     */
    public function ingest(
        string $externalId,
        string $title,
        string $content,
        ?string $category = null,
        array $metadata = [],
        User|Project|null $user = null,
        ?int $documentId = null
    ): array {
        $project = $this->resolveProject($user);
        if (!$project) {
            throw new \RuntimeException('Active project/tenant tidak ditemukan.');
        }

        $chunks = $this->parser->chunkText($content);
        if (empty($chunks)) {
            throw new \InvalidArgumentException('Konten dokumen kosong.');
        }

        $embeddings = $this->embedTexts($chunks, $project);

        // Idempotent upsert: remove existing chunks for the same external_id inside this tenant
        DocumentChunk::where('project_id', $project->id)
            ->where('external_id', $externalId)
            ->delete();

        $chunkIds = [];
        foreach ($chunks as $idx => $chunkText) {
            $record = DocumentChunk::create([
                'project_id' => $project->id,
                'document_id' => $documentId,
                'external_id' => $externalId,
                'title' => $title,
                'category' => $category,
                'chunk_index' => $idx,
                'page_number' => $metadata['page'] ?? 1,
                'content' => $chunkText,
                'embedding' => $embeddings[$idx] ?? $this->localHashEmbedding($chunkText),
                'metadata' => array_merge($metadata, ['page' => $metadata['page'] ?? 1]),
            ]);
            $chunkIds[] = (string) $record->id;
        }

        return [
            'status' => 'indexed',
            'tenant_id' => (string) $project->id,
            'external_id' => $externalId,
            'title' => $title,
            'chunks_created' => count($chunks),
            'point_ids' => $chunkIds,
        ];
    }

    /**
     * Extract page-aware text from a physical file (PDF, DOCX, TXT) and index into the tenant's partition.
     */
    public function uploadDocument(
        string $externalId,
        string $filePath,
        string $filename,
        ?string $category = null,
        array $metadata = [],
        User|Project|null $user = null,
        ?int $documentId = null
    ): array {
        $project = $this->resolveProject($user);
        if (!$project) {
            throw new \RuntimeException('Active project/tenant tidak ditemukan.');
        }

        $pages = $this->parser->extractPagesFromFile($filePath, $filename);

        $allChunks = [];
        $allMeta = [];

        foreach ($pages as $pageItem) {
            $pageNum = $pageItem['page'] ?? 1;
            $pageChunks = $this->parser->chunkText($pageItem['text'] ?? '');

            foreach ($pageChunks as $pChunk) {
                $allChunks[] = $pChunk;
                $allMeta[] = array_merge($metadata, ['page' => $pageNum]);
            }
        }

        if (empty($allChunks)) {
            throw new \RuntimeException(
                'Tidak dapat mengekstrak teks dari file yang diunggah (dokumen kosong atau berupa gambar scan murni).'
            );
        }

        $embeddings = $this->embedTexts($allChunks, $project);

        // Idempotent upsert within tenant boundary
        DocumentChunk::where('project_id', $project->id)
            ->where('external_id', $externalId)
            ->delete();

        $chunkIds = [];
        foreach ($allChunks as $idx => $chunkText) {
            $record = DocumentChunk::create([
                'project_id' => $project->id,
                'document_id' => $documentId,
                'external_id' => $externalId,
                'title' => $filename,
                'category' => $category,
                'chunk_index' => $idx,
                'page_number' => $allMeta[$idx]['page'] ?? 1,
                'content' => $chunkText,
                'embedding' => $embeddings[$idx] ?? $this->localHashEmbedding($chunkText),
                'metadata' => $allMeta[$idx],
            ]);
            $chunkIds[] = (string) $record->id;
        }

        return [
            'status' => 'indexed',
            'tenant_id' => (string) $project->id,
            'external_id' => $externalId,
            'filename' => $filename,
            'chunks_created' => count($allChunks),
            'point_ids' => $chunkIds,
        ];
    }

    /**
     * Perform tenant-isolated hybrid semantic search (Cosine Similarity + Lexical Keyword Boost).
     */
    public function search(
        string $query,
        int $limit = 5,
        ?string $category = null,
        User|Project|null $user = null
    ): array {
        $project = $this->resolveProject($user);
        if (!$project) {
            return ['tenant_id' => null, 'query' => $query, 'results' => []];
        }

        $queryVector = $this->embedTexts([$query], $project)[0] ?? $this->localHashEmbedding($query);

        $builder = DocumentChunk::where('project_id', $project->id);
        if (!empty($category)) {
            $builder->where('category', $category);
        }

        $candidates = $builder->get();
        if ($candidates->isEmpty()) {
            return [
                'tenant_id' => (string) $project->id,
                'query' => $query,
                'total_found' => 0,
                'results' => [],
            ];
        }

        $queryTokens = $this->tokenize($query);
        $scored = [];

        foreach ($candidates as $chunk) {
            $chunkVector = is_array($chunk->embedding) ? $chunk->embedding : [];
            $cosine = $this->cosineSimilarity($queryVector, $chunkVector);

            // Hybrid lexical keyword overlap boost for Indonesian terms & exact matches
            $lexicalBoost = $this->lexicalOverlapScore($queryTokens, $chunk->title . ' ' . $chunk->content);
            $finalScore = min(1.0, ($cosine * 0.80) + ($lexicalBoost * 0.20));

            if ($finalScore > 0.01) {
                $scored[] = [
                    'chunk_id' => (string) $chunk->id,
                    'external_id' => $chunk->external_id,
                    'title' => $chunk->title,
                    'snippet' => $chunk->content,
                    'score' => round($finalScore, 4),
                    'category' => $chunk->category,
                    'source_url' => $chunk->metadata['source_url'] ?? null,
                    'client_metadata' => $chunk->metadata ?? ['page' => $chunk->page_number],
                ];
            }
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);
        $topResults = array_slice($scored, 0, max(1, $limit));

        return [
            'tenant_id' => (string) $project->id,
            'query' => $query,
            'total_found' => count($topResults),
            'results' => $topResults,
        ];
    }

    /**
     * Ask a question and receive a grounded answer with verified citations from the tenant's knowledge base.
     */
    public function ask(
        string $question,
        int $limit = 4,
        ?string $category = null,
        User|Project|null $user = null
    ): array {
        $project = $this->resolveProject($user);
        if (!$project) {
            return [
                'answer' => 'Proyek aktif tidak ditemukan.',
                'citations' => [],
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
            ];
        }

        $searchRes = $this->search($question, $limit, $category, $project);
        $contexts = $searchRes['results'] ?? [];

        [$answerText, $promptTokens, $completionTokens] = $this->synthesizeAnswer(
            $question,
            $contexts,
            $project
        );

        if ($promptTokens > 0 || $completionTokens > 0) {
            TokenUsage::create([
                'project_id' => $project->id,
                'prompt_tokens' => $promptTokens,
                'completion_tokens' => $completionTokens,
                'endpoint' => '/v1/ask',
            ]);
        }

        return [
            'tenant_id' => (string) $project->id,
            'question' => $question,
            'answer' => $answerText,
            'citations' => $contexts,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
        ];
    }

    /**
     * Delete document chunks by external ID within the tenant's partition.
     */
    public function delete(string $externalId, User|Project|null $user = null): array
    {
        $project = $this->resolveProject($user);
        if (!$project) {
            return ['status' => 'error', 'message' => 'Project not found'];
        }

        DocumentChunk::where('project_id', $project->id)
            ->where('external_id', $externalId)
            ->delete();

        return [
            'status' => 'deleted',
            'tenant_id' => (string) $project->id,
            'external_id' => $externalId,
        ];
    }

    /**
     * Check health status of the Unified Laravel 13 RAG engine.
     */
    public function health(): array
    {
        return [
            'status' => 'online',
            'engine' => 'LODEXI Unified Laravel 13 RAG Engine',
            'mode' => 'single-host-native',
        ];
    }

    /**
     * Generate embeddings via Gemini / OpenAI API, or fall back to deterministic local vectors.
     *
     * @param array<int, string> $texts
     * @return array<int, array<int, float>>
     */
    protected function embedTexts(array $texts, ?Project $project = null): array
    {
        if (empty($texts)) {
            return [];
        }

        $apiKey = $project?->llm_api_key ?: config('services.openai.key', env('OPENAI_API_KEY', ''));
        $provider = strtolower($project?->llm_provider ?: env('LLM_PROVIDER', 'gemini'));

        if (!empty($apiKey)) {
            try {
                $baseUrl = $provider === 'gemini'
                    ? 'https://generativelanguage.googleapis.com/v1beta/openai'
                    : 'https://api.openai.com/v1';
                $model = $provider === 'gemini' ? 'text-embedding-004' : 'text-embedding-3-small';

                $response = Http::withToken($apiKey)
                    ->timeout(15)
                    ->post("{$baseUrl}/embeddings", [
                        'model' => $model,
                        'input' => array_values($texts),
                    ]);

                if ($response->successful() && isset($response->json()['data'])) {
                    return array_map(fn ($item) => $item['embedding'], $response->json()['data']);
                }
            } catch (\Throwable $e) {
                // Graceful fallback to deterministic local embeddings
            }
        }

        return array_map(fn ($t) => $this->localHashEmbedding($t), $texts);
    }

    /**
     * Synthesize grounded answer using Gemini / OpenAI or deterministic local synthesis fallback.
     *
     * @return array{0: string, 1: int, 2: int}
     */
    protected function synthesizeAnswer(string $question, array $contexts, Project $project): array
    {
        $apiKey = $project->llm_api_key ?: env('OPENAI_API_KEY', '');
        $provider = strtolower($project->llm_provider ?: env('LLM_PROVIDER', 'gemini'));

        if (empty($apiKey)) {
            if (empty($contexts)) {
                return [
                    'Maaf, belum ada dokumen yang cocok di dalam basis pengetahuan proyek Anda. Silakan unggah dokumen terlebih dahulu atau atur LLM API Key di menu Model Provider.',
                    0,
                    0,
                ];
            }

            $titles = array_values(array_unique(array_map(fn ($c) => $c['title'], $contexts)));
            $topSnippet = $contexts[0]['snippet'];
            return [
                "Berdasarkan dokumen resmi yang tersedia ([" . implode('], [', $titles) . "]):\n\n" . $topSnippet,
                0,
                0,
            ];
        }

        $baseUrl = $provider === 'gemini'
            ? 'https://generativelanguage.googleapis.com/v1beta/openai'
            : 'https://api.openai.com/v1';
        $model = $provider === 'gemini'
            ? env('GEMINI_MODEL', 'gemini-2.0-flash')
            : env('OPENAI_MODEL', 'gpt-4o-mini');

        if (empty($contexts)) {
            $systemPrompt = $project->system_prompt ?: (
                'Anda adalah Asisten Lodexi AI yang sangat ramah. Pengguna memberikan sapaan atau ' .
                'pertanyaan di luar konteks dokumen. Balas sapaan mereka dengan hangat, dan ingatkan ' .
                'mereka dengan sopan bahwa Anda adalah asisten yang dikhususkan untuk menjawab pertanyaan ' .
                'seputar dokumen yang telah mereka unggah.'
            );
            $userPrompt = "Pesan Pengguna:\n{$question}\n\nBalasan Ramah:";
        } else {
            $contextBlocks = [];
            foreach ($contexts as $idx => $c) {
                $page = $c['client_metadata']['page'] ?? null;
                $pageInfo = $page ? " (Halaman {$page})" : '';
                $num = $idx + 1;
                $contextBlocks[] = "[{$num}] Dokumen: {$c['title']}{$pageInfo} (ID: {$c['external_id']})\n{$c['snippet']}";
            }
            $contextText = implode("\n\n", $contextBlocks);
            $baseSystemPrompt = $project->system_prompt
                ?: 'Anda adalah Asisten Auditor Dokumen Resmi (Lodexi AI). Tugas Anda HANYA menjawab pertanyaan berdasarkan Konteks Dokumen yang diberikan.';

            $systemPrompt = "{$baseSystemPrompt}\n\n" .
                "ATURAN SUPER KETAT:\n" .
                "1. Anda DILARANG KERAS menggunakan pengetahuan umum Anda sendiri. Jawaban HANYA boleh berasal dari teks yang ada di Konteks.\n" .
                "2. Jika jawaban tidak ada di dalam Konteks, Anda WAJIB menjawab: 'Maaf, informasi tersebut tidak ditemukan di dalam dokumen yang Anda unggah.'\n" .
                "3. Anda WAJIB menyertakan kutipan sumber (sitasi) untuk setiap fakta yang Anda sebutkan dengan format [Nama Dokumen].\n" .
                "4. Jangan berhalusinasi atau menebak-nebak.";

            $userPrompt = "KONTEKS DOKUMEN:\n{$contextText}\n\nPERTANYAAN USER:\n{$question}\n\nJAWABAN TERPERINCI DAN BERSITASI:";
        }

        try {
            $response = Http::withToken($apiKey)
                ->timeout(25)
                ->post("{$baseUrl}/chat/completions", [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $answer = $data['choices'][0]['message']['content'] ?? 'Tidak dapat menghasilkan jawaban.';
                $promptTokens = (int) ($data['usage']['prompt_tokens'] ?? 0);
                $completionTokens = (int) ($data['usage']['completion_tokens'] ?? 0);

                return [$answer, $promptTokens, $completionTokens];
            }

            return ['Error dari provider LLM: ' . $response->body(), 0, 0];
        } catch (\Throwable $e) {
            return ['Error saat menghubungi LLM (' . $e->getMessage() . ').', 0, 0];
        }
    }

    /**
     * Deterministic hashing-based 384-d unit vector embedding for zero-cost / offline consistency.
     *
     * @return array<int, float>
     */
    protected function localHashEmbedding(string $text): array
    {
        $vec = array_fill(0, $this->localDimension, 0.0);
        $tokens = $this->tokenize($text);

        foreach ($tokens as $token) {
            $hash = unpack('N', substr(md5($token, true), 0, 4))[1];
            $idx = $hash % $this->localDimension;
            $vec[$idx] += 1.0;
        }

        $sumSq = 0.0;
        foreach ($vec as $v) {
            $sumSq += $v * $v;
        }
        $norm = sqrt($sumSq);

        if ($norm > 0) {
            foreach ($vec as $i => $v) {
                $vec[$i] = round($v / $norm, 6);
            }
        } else {
            $vec[0] = 1.0;
        }

        return $vec;
    }

    protected function cosineSimilarity(array $vecA, array $vecB): float
    {
        $len = min(count($vecA), count($vecB));
        if ($len === 0) {
            return 0.0;
        }

        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < $len; $i++) {
            $a = (float) $vecA[$i];
            $b = (float) $vecB[$i];
            $dot += $a * $b;
            $normA += $a * $a;
            $normB += $b * $b;
        }

        $denom = sqrt($normA) * sqrt($normB);
        return $denom > 0.0 ? max(0.0, $dot / $denom) : 0.0;
    }

    protected function lexicalOverlapScore(array $queryTokens, string $targetText): float
    {
        if (empty($queryTokens)) {
            return 0.0;
        }

        $targetLower = mb_strtolower($targetText);
        $matches = 0;
        foreach ($queryTokens as $token) {
            if (mb_strlen($token) > 2 && str_contains($targetLower, $token)) {
                $matches++;
            }
        }

        return $matches / count($queryTokens);
    }

    /**
     * @return array<int, string>
     */
    protected function tokenize(string $text): array
    {
        $clean = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', mb_strtolower($text)) ?? '';
        $parts = preg_split('/\s+/u', trim($clean)) ?: [];
        $stopWords = ['apa', 'berapa', 'kapan', 'siapa', 'mengapa', 'bagaimana', 'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'ini', 'itu', 'atau', 'pada', 'dengan', 'adalah'];

        return array_values(array_filter($parts, fn ($w) => $w !== '' && !in_array($w, $stopWords, true)));
    }
}
