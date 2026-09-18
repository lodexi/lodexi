<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's LLM AI settings.
     */
    public function updateLlmSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'llm_provider' => ['required', 'string', 'in:gemini,openai'],
            'llm_api_key' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->fill($validated);
        $request->user()->save();

        return Redirect::route('profile.edit');
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

        return Redirect::route('profile.edit')->with('success', 'AI Persona updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
