<?php

namespace App\Http\Controllers;

use App\Services\LodexService;
use App\Models\TokenUsage;
use Illuminate\Http\Request;

class LodexPortalController extends Controller
{
    protected LodexService $lodex;

    public function __construct(LodexService $lodex)
    {
        $this->lodex = $lodex;
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
     * Handle semantic search request.
     */
    public function search(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        $results = $this->lodex->search(
            $request->input('query'),
            $request->input('limit', 5),
            $request->input('category'),
            auth()->user()
        );
        return response()->json($results);
    }

    /**
     * Handle grounded Q&A request.
     */
    public function ask(Request $request)
    {
        $request->validate(['question' => 'required|string|min:1']);
        $answer = $this->lodex->ask(
            $request->input('question'),
            $request->input('limit', 4),
            $request->input('category'),
            auth()->user()
        );
        
        // Log Token Usage
        if (isset($answer['prompt_tokens']) || isset($answer['completion_tokens'])) {
            TokenUsage::create([
                'project_id' => auth()->user()->current_project_id,
                'prompt_tokens' => $answer['prompt_tokens'] ?? 0,
                'completion_tokens' => $answer['completion_tokens'] ?? 0,
                'endpoint' => '/v1/ask'
            ]);
        }

        return response()->json($answer);
    }

    /**
     * Ingest a document.
     */
    public function ingest(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:txt,pdf,docx|max:102400', // Limit to 100MB files
        ]);

        if (!$request->hasFile('document') || !$request->file('document')->isValid()) {
            return response()->json(['error' => 'Gagal mengunggah file. Mungkin ukurannya melebihi batas upload_max_filesize di PHP.'], 400);
        }

        $file = $request->file('document');
        $filename = $file->getClientOriginalName();
        $size = number_format($file->getSize() / 1048576, 2) . ' MB';
        $externalId = 'doc_' . uniqid();

        // Save to Database
        $document = \App\Models\Document::create([
            'project_id' => auth()->user()->current_project_id,
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
                auth()->user()
            );
            
            // Update status to Ingested
            $document->update(['status' => 'Ingested']);
            return response()->json(['message' => 'Document ingested successfully', 'document' => $document, 'result' => $res]);

        } catch (\Exception $e) {
            $document->update(['status' => 'Failed']);
            return response()->json(['error' => 'Failed to ingest document', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a document from portal and vector store.
     */
    public function destroy($id)
    {
        $document = \App\Models\Document::where('project_id', auth()->user()->current_project_id)->findOrFail($id);

        try {
            // Delete from Vector Store (Qdrant) via Core API
            $this->lodex->delete($document->external_id, auth()->user());
            
            // Delete from MySQL Database
            $document->delete();
            
            return redirect()->back()->with('success', 'Document deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete document: ' . $e->getMessage());
        }
    }
}
