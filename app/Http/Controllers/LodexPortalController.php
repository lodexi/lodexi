<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use App\Services\LodexService;
use Illuminate\Http\Request;

class LodexPortalController extends Controller
{
    protected LodexService $lodex;

    public function __construct(LodexService $lodex)
    {
        $this->lodex = $lodex;
    }

    /**
     * Resolve current Project ID from authenticated User or Sanctum Project token.
     */
    protected function resolveProjectId(Request $request): ?int
    {
        $actor = $request->user();
        if ($actor instanceof Project) {
            return $actor->id;
        }
        if ($actor instanceof User) {
            return $actor->current_project_id;
        }
        return null;
    }

    /**
     * Show the main Laravel client portal.
     */
    public function index()
    {
        $health = $this->lodex->health();
        return inertia('Portal/Index', compact('health'));
    }

    /**
     * Handle semantic search request (Web Portal & Sanctum API /api/v1/search).
     */
    public function search(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        $results = $this->lodex->search(
            $request->input('query'),
            (int) $request->input('limit', 5),
            $request->input('category') ?? $request->input('category_filter'),
            $request->user()
        );
        return response()->json($results);
    }

    /**
     * Handle grounded Q&A request (Web Portal & Sanctum API /api/v1/ask).
     */
    public function ask(Request $request)
    {
        $request->validate(['question' => 'required|string|min:1']);
        $answer = $this->lodex->ask(
            $request->input('question'),
            (int) $request->input('limit', 4),
            $request->input('category') ?? $request->input('category_filter'),
            $request->user()
        );

        return response()->json($answer);
    }

    /**
     * Ingest either a physical document file (PDF, DOCX, TXT) or raw JSON text content.
     */
    public function ingest(Request $request)
    {
        $projectId = $this->resolveProjectId($request);
        if (!$projectId) {
            return response()->json(['error' => 'Project / Tenant tidak ditemukan.'], 403);
        }

        // Case 1: Raw JSON Text Ingestion (via API /api/v1/ingest)
        if (!$request->hasFile('document') && $request->filled('content')) {
            $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'external_id' => 'nullable|string|max:255',
                'category' => 'nullable|string|max:100',
                'metadata' => 'nullable|array',
            ]);

            $externalId = $request->input('external_id') ?: 'doc_' . uniqid();
            $title = $request->input('title');
            $content = $request->input('content');
            $sizeKb = number_format(strlen($content) / 1024, 2) . ' KB';

            $document = Document::updateOrCreate(
                ['project_id' => $projectId, 'external_id' => $externalId],
                [
                    'filename' => $title,
                    'size' => $sizeKb,
                    'status' => 'Processing',
                ]
            );

            try {
                $res = $this->lodex->ingest(
                    $externalId,
                    $title,
                    $content,
                    $request->input('category'),
                    $request->input('metadata', []),
                    $request->user(),
                    $document->id
                );

                $document->update(['status' => 'Ingested']);
                return response()->json([
                    'message' => 'Document ingested successfully',
                    'document' => $document,
                    'result' => $res,
                ], 201);
            } catch (\Throwable $e) {
                $document->update(['status' => 'Failed']);
                return response()->json(['error' => 'Failed to ingest document', 'details' => $e->getMessage()], 500);
            }
        }

        // Case 2: Physical File Upload (PDF, DOCX, TXT)
        $request->validate([
            'document' => 'required|file|mimes:txt,pdf,docx,md,csv|max:102400',
        ]);

        if (!$request->hasFile('document') || !$request->file('document')->isValid()) {
            return response()->json(['error' => 'Gagal mengunggah file. Mungkin ukurannya melebihi batas upload_max_filesize di PHP.'], 400);
        }

        $file = $request->file('document');
        $filename = $file->getClientOriginalName();
        $size = number_format($file->getSize() / 1048576, 2) . ' MB';
        $externalId = $request->input('external_id') ?: 'doc_' . uniqid();

        $document = Document::create([
            'project_id' => $projectId,
            'filename' => $filename,
            'size' => $size,
            'status' => 'Processing',
            'external_id' => $externalId,
        ]);

        try {
            $res = $this->lodex->uploadDocument(
                $externalId,
                $file->getRealPath(),
                $filename,
                $request->input('category'),
                [],
                $request->user(),
                $document->id
            );

            $document->update(['status' => 'Ingested']);
            return response()->json([
                'message' => 'Document ingested successfully',
                'document' => $document,
                'result' => $res,
            ]);
        } catch (\Throwable $e) {
            $document->update(['status' => 'Failed']);
            return response()->json(['error' => 'Failed to ingest document', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a document and its vector chunks from the tenant's partition.
     */
    public function destroy(Request $request, $id)
    {
        $projectId = $this->resolveProjectId($request);
        $document = Document::where('project_id', $projectId)->findOrFail($id);

        try {
            $this->lodex->delete($document->external_id, $request->user());
            $document->delete();

            if ($request->wantsJson()) {
                return response()->json(['status' => 'deleted', 'external_id' => $document->external_id]);
            }

            return redirect()->back()->with('success', 'Document deleted successfully');
        } catch (\Throwable $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }
}
