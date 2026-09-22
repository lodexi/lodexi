<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;
use App\Models\User;

class LodexService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $tenantId;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.lodex.url', 'http://127.0.0.1:8000'), '/');
        $this->apiKey = config('services.lodex.key', 'key_staffportal_secret_456');
        $this->tenantId = config('services.lodex.tenant_id', 'staff_portal');
    }

    /**
     * Get HTTP client with pre-configured API Key and headers.
     */
    protected function client(?User $user = null)
    {
        $headers = [
            'X-API-Key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
        
        if ($user) {
            if ($user->current_project_id) {
                $headers['X-Project-ID'] = (string)$user->current_project_id;
            }
            if ($user->currentProject && $user->currentProject->llm_api_key) {
                $headers['X-Tenant-LLM-Key'] = $user->currentProject->llm_api_key;
                if ($user->currentProject->llm_provider) {
                    $headers['X-Tenant-LLM-Provider'] = $user->currentProject->llm_provider;
                }
            }
        }
        
        return Http::withHeaders($headers)->timeout(60);
    }

    /**
     * Ingest a document into the tenant's knowledge partition (JSON text).
     */
    public function ingest(string $externalId, string $title, string $content, ?string $category = null, array $metadata = [], ?User $user = null): array
    {
        $response = $this->client($user)->post("{$this->baseUrl}/v1/documents", [
            'external_id' => $externalId,
            'title' => $title,
            'content' => $content,
            'category' => $category,
            'metadata' => $metadata,
        ]);

        return $response->json();
    }

    /**
     * Upload a physical document (PDF, DOCX, TXT) to the tenant's knowledge partition.
     */
    public function uploadDocument(string $externalId, string $filePath, string $filename, ?string $category = null, array $metadata = [], ?User $user = null): array
    {
        $headers = [
            'X-API-Key' => $this->apiKey,
            'Accept' => 'application/json',
            // Do not set Content-Type to application/json, let Laravel set it to multipart/form-data
        ];
        
        if ($user) {
            if ($user->current_project_id) {
                $headers['X-Project-ID'] = (string)$user->current_project_id;
            }
            if ($user->currentProject && $user->currentProject->llm_api_key) {
                $headers['X-Tenant-LLM-Key'] = $user->currentProject->llm_api_key;
                if ($user->currentProject->llm_provider) {
                    $headers['X-Tenant-LLM-Provider'] = $user->currentProject->llm_provider;
                }
            }
        }
        
        $response = Http::withHeaders($headers)->timeout(60)
          ->attach('file', fopen($filePath, 'r'), $filename)
          ->post("{$this->baseUrl}/v1/documents/upload", [
              'external_id' => $externalId,
              'category' => $category ?? '',
              'metadata_json' => json_encode($metadata),
          ]);

        if ($response->failed()) {
            throw new \Exception('LODEXI Core Error: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Perform semantic vector search over the tenant's catalog/documents.
     */
    public function search(string $query, int $limit = 5, ?string $category = null, ?User $user = null): array
    {
        $response = $this->client($user)->post("{$this->baseUrl}/v1/search", [
            'query' => $query,
            'limit' => $limit,
            'category_filter' => $category,
        ]);

        return $response->json();
    }

    /**
     * Ask a question and receive a grounded answer with verified citations.
     */
    public function ask(string $question, int $limit = 4, ?string $category = null, ?User $user = null): array
    {
        $payload = [
            'question' => $question,
            'limit' => $limit,
            'category_filter' => $category,
        ];

        if ($user && $user->currentProject && $user->currentProject->system_prompt) {
            $payload['system_prompt'] = $user->currentProject->system_prompt;
        }

        $response = $this->client($user)->post("{$this->baseUrl}/v1/ask", $payload);
        $result = $response->json();

        // Track token usage globally
        if ($user && $user->current_project_id) {
            if (isset($result['prompt_tokens']) || isset($result['completion_tokens'])) {
                \App\Models\TokenUsage::create([
                    'project_id' => $user->current_project_id,
                    'prompt_tokens' => $result['prompt_tokens'] ?? 0,
                    'completion_tokens' => $result['completion_tokens'] ?? 0,
                    'endpoint' => '/v1/ask'
                ]);
            }
        }

        return $result;
    }

    /**
     * Delete document chunks by external ID.
     */
    public function delete(string $externalId, ?User $user = null): array
    {
        $response = $this->client($user)->delete("{$this->baseUrl}/v1/documents/{$externalId}");
        return $response->json();
    }

    /**
     * Check health status of LODEX AI engine.
     */
    public function health(): array
    {
        try {
            $response = Http::timeout(3)->get("{$this->baseUrl}/health");
            return $response->json() ?? ['status' => 'offline'];
        } catch (\Exception $e) {
            return ['status' => 'offline', 'error' => $e->getMessage()];
        }
    }
}
