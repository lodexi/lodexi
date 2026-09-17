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
        // 1. Create projects table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('system_prompt')->nullable();
            $table->string('chat_integration_type')->nullable(); // e.g. whatsapp, google_chat
            $table->string('chat_integration_webhook')->nullable();
            $table->timestamps();
        });

        // 2. Add current_project_id to users
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('current_project_id')->nullable()->after('id');
            // We'll add the foreign key constraint after data migration
        });

        // 3. Migrate existing users to have a default project
        $users = DB::table('users')->get();
        
        // Build mapping of user_id -> default_project_id
        $userProjectMap = [];

        foreach ($users as $user) {
            $projectId = DB::table('projects')->insertGetId([
                'user_id' => $user->id,
                'name' => $user->name . "'s Workspace",
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $userProjectMap[$user->id] = $projectId;

            // Set current project
            DB::table('users')->where('id', $user->id)->update([
                'current_project_id' => $projectId
            ]);
        }

        // Add foreign key constraint to users now that data is safe
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('current_project_id')->references('id')->on('projects')->nullOnDelete();
        });

        // 4. Update documents table
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('id');
        });

        foreach ($userProjectMap as $userId => $projectId) {
            DB::table('documents')->where('user_id', $userId)->update(['project_id' => $projectId]);
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            // Now enforce non-null and constraint
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
        
        // Fix project_id nullable -> required
        DB::statement('ALTER TABLE documents MODIFY project_id BIGINT UNSIGNED NOT NULL');

        // 5. Update token_usages table
        Schema::table('token_usages', function (Blueprint $table) {
            $table->unsignedBigInteger('project_id')->nullable()->after('id');
        });

        foreach ($userProjectMap as $userId => $projectId) {
            DB::table('token_usages')->where('user_id', $userId)->update(['project_id' => $projectId]);
        }

        Schema::table('token_usages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });

        DB::statement('ALTER TABLE token_usages MODIFY project_id BIGINT UNSIGNED NOT NULL');

        // 6. Update personal_access_tokens
        // Currently tokenable_type = 'App\Models\User' and tokenable_id = user_id
        foreach ($userProjectMap as $userId => $projectId) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\Models\User')
                ->where('tokenable_id', $userId)
                ->update([
                    'tokenable_type' => 'App\Models\Project',
                    'tokenable_id' => $projectId,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting this complex migration means restoring user_id columns
        
        // 1. Revert personal_access_tokens
        // We'll try to find the user_id from the project
        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\Models\Project')
                ->where('tokenable_id', $project->id)
                ->update([
                    'tokenable_type' => 'App\Models\User',
                    'tokenable_id' => $project->user_id,
                ]);
        }

        // 2. Revert token_usages
        Schema::table('token_usages', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
        });

        foreach ($projects as $project) {
            DB::table('token_usages')->where('project_id', $project->id)->update(['user_id' => $project->user_id]);
        }

        Schema::table('token_usages', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        
        DB::statement('ALTER TABLE token_usages MODIFY user_id BIGINT UNSIGNED NOT NULL');

        // 3. Revert documents
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
        });

        foreach ($projects as $project) {
            DB::table('documents')->where('project_id', $project->id)->update(['user_id' => $project->user_id]);
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        DB::statement('ALTER TABLE documents MODIFY user_id BIGINT UNSIGNED NOT NULL');

        // 4. Drop current_project_id from users
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_project_id']);
            $table->dropColumn('current_project_id');
        });

        // 5. Drop projects table
        Schema::dropIfExists('projects');
    }
};
