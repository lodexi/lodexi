<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    /**
     * Display the AI Settings page.
     */
    public function edit(Request $request): Response
    {
        $project = $request->user()->currentProject;

        return Inertia::render('Dashboard/AiSettings', [
            'project' => $project,
        ]);
    }

    /**
     * Update the active project's LLM API settings.
     */
    public function updateLlm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'llm_provider' => ['required', 'string', 'in:gemini,openai'],
            'llm_api_key' => ['nullable', 'string', 'max:255'],
        ]);

        $project = $request->user()->currentProject;
        
        if ($project) {
            $project->update($validated);
        }

        return Redirect::route('dashboard.ai-settings')->with('status', 'llm-settings-updated');
    }

    /**
     * Update the active project's AI persona (system prompt).
     */
    public function updatePersona(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'system_prompt' => ['nullable', 'string', 'max:5000'],
        ]);

        $project = $request->user()->currentProject;
        
        if ($project) {
            $project->update($validated);
        }

        return Redirect::route('dashboard.ai-settings')->with('status', 'persona-updated');
    }
}
