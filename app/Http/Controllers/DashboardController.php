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

    /**
     * Display the Integrations hub.
     */
    public function integrations(Request $request): Response
    {
        $projectId = $request->user()->current_project_id;
        
        $analytics = [
            'total_requests' => TokenUsage::where('project_id', $projectId)->count(),
            'prompt_tokens' => TokenUsage::where('project_id', $projectId)->sum('prompt_tokens'),
            'completion_tokens' => TokenUsage::where('project_id', $projectId)->sum('completion_tokens'),
        ];
        
        $tokens = $request->user()->currentProject->tokens()->orderBy('created_at', 'desc')->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never',
                'created_at' => $token->created_at->format('M j, Y'),
            ];
        });

        return Inertia::render('Dashboard/Integrations', [
            'analytics' => $analytics,
            'tokens' => $tokens,
            'new_token' => session('new_token'),
            'active_tab' => $request->query('tab', 'api-keys'),
        ]);
    }
}
