<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnifiedRagIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_multi_tenant_rag_ingest_search_and_isolation(): void
    {
        $userA = User::factory()->create();
        $tenantA = Project::create([
            'user_id' => $userA->id,
            'name' => 'JIU Library Catalog',
        ]);
        $userA->update(['current_project_id' => $tenantA->id]);

        $userB = User::factory()->create();
        $tenantB = Project::create([
            'user_id' => $userB->id,
            'name' => 'Staff Portal HRD',
        ]);
        $userB->update(['current_project_id' => $tenantB->id]);

        $tokenA = $tenantA->createToken('library-key')->plainTextToken;
        $tokenB = $tenantB->createToken('staff-key')->plainTextToken;

        // 1. Ingest into Tenant A (JIU Library)
        $resIngestA = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/ingest', [
                'external_id' => 'book_001',
                'title' => 'Aturan Peminjaman Buku Perpustakaan JIU',
                'content' => 'Mahasiswa dapat meminjam maksimal 5 buku selama 14 hari kerja. Denda keterlambatan adalah Rp 2.000 per hari.',
                'category' => 'policy',
            ]);
        $resIngestA->assertStatus(201);

        // 2. Ingest into Tenant B (Staff Portal)
        $resIngestB = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/ingest', [
                'external_id' => 'sop_hr_01',
                'title' => 'SOP Pengajuan Cuti Tahunan Pegawai',
                'content' => 'Pegawai tetap berhak mengajukan cuti tahunan sebanyak 12 hari kerja melalui portal HRD minimal 7 hari sebelum tanggal cuti.',
                'category' => 'sop',
            ]);
        $resIngestB->assertStatus(201);

        // 3. Search on Tenant A for library fine rules -> should find book_001 and NEVER sop_hr_01
        $resSearchA = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/search', [
                'query' => 'Berapa denda keterlambatan peminjaman buku perpustakaan?',
                'limit' => 5,
            ]);
        $resSearchA->assertOk();
        $resultsA = $resSearchA->json('results');
        $this->assertNotEmpty($resultsA);
        $this->assertEquals('book_001', $resultsA[0]['external_id']);

        foreach ($resultsA as $hit) {
            $this->assertNotEquals('sop_hr_01', $hit['external_id'], 'Cross-tenant leakage detected!');
        }

        // 4. Ask on Tenant B for leave SOP -> should return grounded answer citing SOP
        $resAskB = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/ask', [
                'question' => 'Bagaimana aturan pengajuan cuti tahunan pegawai?',
                'limit' => 3,
            ]);
        $resAskB->assertOk();
        $this->assertStringContainsString('SOP Pengajuan Cuti Tahunan Pegawai', $resAskB->json('answer'));
    }
}

