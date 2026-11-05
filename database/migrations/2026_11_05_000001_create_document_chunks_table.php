<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('documents')->cascadeOnDelete();
            $table->string('external_id')->index();
            $table->string('title');
            $table->string('category')->nullable()->index();
            $table->unsignedInteger('chunk_index')->default(0);
            $table->unsignedInteger('page_number')->nullable();
            $table->longText('content');
            $table->json('embedding');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'external_id']);
            $table->index(['project_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_chunks');
    }
};

