<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\TokenUsage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Home Overview dashboard.
     */
    public function home(Request $request): Response
    {
        $projectId = $request->user()->current_project_id;
        
        $documentCount = Document::where('project_id', $projectId)->count();
        $totalRequests = TokenUsage::where('project_id', $projectId)->count();
        $promptTokens = TokenUsage::where('project_id', $projectId)->sum('prompt_tokens');
        $completionTokens = TokenUsage::where('project_id', $projectId)->sum('completion_tokens');

        return Inertia::render('Dashboard/Home', [
            'stats' => [
                'total_documents' => $documentCount,
                'total_requests' => $totalRequests,
                'prompt_tokens' => (int) $promptTokens,
                'completion_tokens' => (int) $completionTokens,
                'total_tokens' => (int) ($promptTokens + $completionTokens),
            ]
        ]);
    }
}
