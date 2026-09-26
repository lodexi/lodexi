<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class ApiKeyController extends Controller
{
    /**
     * Create a new API token.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $token = $request->user()->currentProject->createToken($request->name);

        // Flash the plain text token to the session so it can be shown once.
        return Redirect::route('dashboard.settings.apikeys')->with('new_token', $token->plainTextToken);
    }

    /**
     * Delete an API token.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $request->user()->currentProject->tokens()->where('id', $id)->delete();

        return Redirect::route('dashboard.settings.apikeys');
    }
}
