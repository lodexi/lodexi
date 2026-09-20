<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add columns to projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->string('llm_api_key')->nullable()->after('chat_integration_webhook');
            $table->string('llm_provider')->default('gemini')->after('llm_api_key');
        });

        // 2. For each user, copy existing llm settings to their default project (or create one if missing)
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            // Find the user's current project (should have been set by previous migration, but ensure existence)
            $projectId = DB::table('projects')->where('user_id', $user->id)->first()?->id;
            if (!$projectId) {
                // Create a fallback project if none exists
                $projectId = DB::table('projects')->insertGetId([
                    'user_id' => $user->id,
                    'name' => $user->name . "'s Workspace",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                // Update user's current_project_id
                DB::table('users')->where('id', $user->id)->update(['current_project_id' => $projectId]);
            }
            // Copy llm settings
            DB::table('projects')->where('id', $projectId)->update([
                'llm_api_key' => $user->llm_api_key,
                'llm_provider' => $user->llm_provider ?? 'gemini',
            ]);
        }

        // 3. Drop llm columns from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['llm_api_key', 'llm_provider']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add columns to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('llm_api_key')->nullable();
            $table->string('llm_provider')->default('gemini');
        });

        // 2. Copy data back from projects to users (choose first project per user)
        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            DB::table('users')->where('id', $project->user_id)->update([
                'llm_api_key' => $project->llm_api_key,
                'llm_provider' => $project->llm_provider,
            ]);
        }

        // 3. Drop columns from projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['llm_api_key', 'llm_provider']);
        });
    }
};
