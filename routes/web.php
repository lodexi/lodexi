<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LodexPortalController;
use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectSettingsController;
use App\Models\TokenUsage;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('portal.home');

Route::get('/docs/{page?}', [\App\Http\Controllers\DocsController::class, 'show'])->name('docs');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/portal/search', [LodexPortalController::class, 'search'])->name('portal.search');
    Route::post('/portal/ask', [LodexPortalController::class, 'ask'])->name('portal.ask');
    Route::post('/portal/ingest', [LodexPortalController::class, 'ingest'])->name('portal.ingest');
    Route::delete('/portal/documents/{id}', [LodexPortalController::class, 'destroy'])->name('portal.documents.destroy');
    
    Route::post('/projects/{project}/switch', [ProjectController::class, 'switch'])->name('projects.switch');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');

    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'home'])->name('dashboard');

    Route::get('/dashboard/knowledge', function () {
        $documents = \App\Models\Document::where('project_id', auth()->user()->current_project_id)->latest()->get();
        return Inertia::render('Dashboard/Knowledge', [
            'documents' => $documents
        ]);
    })->name('dashboard.knowledge');



    Route::post('/dashboard/apikeys', [ApiKeyController::class, 'store'])->name('dashboard.apikeys.store');
    Route::delete('/dashboard/apikeys/{id}', [ApiKeyController::class, 'destroy'])->name('dashboard.apikeys.destroy');

    Route::get('/dashboard/playground', function () {
        return Inertia::render('Dashboard/Playground');
    })->name('dashboard.playground');

    Route::get('/dashboard/settings/model', [ProjectSettingsController::class, 'modelProvider'])->name('dashboard.settings.model');
    Route::get('/dashboard/settings/trigger', [ProjectSettingsController::class, 'trigger'])->name('dashboard.settings.trigger');
    Route::get('/dashboard/settings/strategy', [ProjectSettingsController::class, 'agentStrategy'])->name('dashboard.settings.strategy');
    Route::put('/dashboard/settings/llm', [ProjectSettingsController::class, 'updateLlm'])->name('dashboard.settings.update_llm');
    Route::put('/dashboard/settings/persona', [ProjectSettingsController::class, 'updatePersona'])->name('dashboard.settings.update_persona');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
