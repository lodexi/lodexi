<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\TokenUsage;
use App\Models\Project;

class ProjectSettingsController extends Controller
{
    /**
     * Display the Model Provider settings page (API Keys & LLM settings).
     */
    public function modelProvider(Request $request): Response
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

        return Inertia::render('Dashboard/Settings/ModelProvider', [
            'analytics' => $analytics,
            'tokens' => $tokens,
            'new_token' => session('new_token'),
        ]);
    }

    /**
     * Display the Trigger settings page (Webhooks).
     */
    public function trigger(Request $request): Response
    {
        return Inertia::render('Dashboard/Settings/Trigger');
    }

    /**
     * Display the Agent Strategy settings page (Persona).
     */
    public function agentStrategy(Request $request): Response
    {
        return Inertia::render('Dashboard/Settings/AgentStrategy', [
            'project' => clone $request->user()->currentProject,
        ]);
    }

    /**
     * Update the LLM settings for the current project.
     */
    public function updateLlm(Request $request)
    {
        $request->validate([
            'llm_provider' => 'required|string|in:openai,anthropic,gemini,ollama',
            'llm_api_key' => 'nullable|string',
        ]);

        $project = Project::findOrFail($request->user()->current_project_id);
        
        $project->update([
            'llm_provider' => $request->llm_provider,
            'llm_api_key' => $request->llm_api_key,
        ]);

        return redirect()->back()->with('success', 'LLM Provider settings updated successfully.');
    }

    /**
     * Update the AI Persona / System Prompt for the current project.
     */
    public function updatePersona(Request $request)
    {
        $request->validate([
            'system_prompt' => 'nullable|string|max:4000',
        ]);

        $project = Project::findOrFail($request->user()->current_project_id);
        
        $project->update([
            'system_prompt' => $request->system_prompt,
        ]);

        return redirect()->back()->with('success', 'AI Persona updated successfully.');
    }
}
