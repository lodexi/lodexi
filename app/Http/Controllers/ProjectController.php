<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use App\Models\Project;

class ProjectController extends Controller
{
    /**
     * Switch the active project.
     */
    public function switch(Request $request, Project $project): RedirectResponse
    {
        // Ensure the user owns the project
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->user()->update([
            'current_project_id' => $project->id,
        ]);

        return Redirect::back()->with('success', 'Workspace switched to ' . $project->name);
    }

    /**
     * Create a new project.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $project = Project::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
        ]);

        // Automatically switch to the newly created project
        $request->user()->update([
            'current_project_id' => $project->id,
        ]);

        return Redirect::back()->with('success', 'Workspace "' . $project->name . '" created successfully.');
    }
}
