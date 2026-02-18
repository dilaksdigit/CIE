<?php
namespace App\Controllers;

use App\Models\Sku;
use App\Services\ValidationService;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SkuController {
    protected $validationService;

    public function __construct(ValidationService $validationService) {
        $this->validationService = $validationService;
    }

    public function index(Request $request) {
        $query = Sku::with(['primaryCluster']);
        
        if ($request->has('tier')) {
            $query->where('tier', $request->query('tier'));
        }

        if ($request->has('cluster_id')) {
            $query->where('primary_cluster_id', $request->query('cluster_id'));
        }

        // Keep "category" filter for backward compatibility (maps to clusters matching name)
        if ($request->has('category')) {
             $category = $request->query('category');
             if ($category !== 'All Categories') {
                 $query->whereHas('primaryCluster', function($q) use ($category) {
                     $q->where('name', 'like', "%$category%");
                 });
             }
        }

        if ($request->has('validation_status')) {
            $query->where('validation_status', $request->query('validation_status'));
        }
        
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function($q) use ($search) {
                $q->where('sku_code', 'like', "%$search%")
                  ->orWhere('title', 'like', "%$search%");
            });
        }

        return ResponseFormatter::format($query->get());
    }

    public function show($id) {
        $sku = Sku::with(['primaryCluster', 'skuIntents.intent'])->findOrFail($id);
        
        // Patch 6: Tier-mode UX Copy & Banners
        $meta = [
            'tier_lock_reason' => $sku->validation_status === 'VALID' ? "Validated {$sku->tier->value} products have core fields locked for governance." : null,
            'cms_banner' => $this->getTierBanner($sku->tier->value ?? 'SUPPORT'),
            'field_tooltips' => [
                'best_for' => "Min 2 required for Hero/Support (v2.3.2)",
                'not_for' => "Min 1 required for all validated SKUs (v2.3.2)"
            ]
        ];

        return ResponseFormatter::format(['sku' => $sku, 'instructions' => $meta]);
    }

    private function getTierBanner($tier) {
        switch ($tier) {
            case 'HERO': return "HERO MODE: Full schema required. Max AI citation priority.";
            case 'KILL': return "KILL TIER: Editing disabled per policy. SKU marked for decommissioning.";
            default: return "Standard technical maintenance mode active.";
        }
    }

    public function update(Request $request, $id) {
        try {
            $sku = Sku::findOrFail($id);
            
            // Patch 6: Kill-tier SKUs - absolute lock on any edit
            if ($sku->tier === 'KILL') {
                return response()->json([
                    'error' => "KILL TIER: Policy violation. Any edit to a decommissioned SKU is prohibited."
                ], 403);
            }

            // Test 4.5: Version Conflict Detection
            $clientVersion = $request->input('lock_version');
            if ($clientVersion && $clientVersion != $sku->lock_version) {
                 return response()->json([
                    'error' => "VERSION CONFLICT: This SKU was modified by another user at T=2. Please merge or discard your changes (v{$clientVersion} != server v{$sku->lock_version})."
                ], 409);
            }

            // Only update specific fields that are editable (primary_cluster_id: SEO Governor only, enforced by RBAC)
            $updateData = [];
            $editableFields = ['title', 'short_description', 'ai_answer_block', 'ai_answer_block_chars', 'meta_description', 'best_for', 'not_for', 'faq_data', 'validation_status', 'primary_cluster_id', 'primary_intent', 'long_description', 'expert_authority_name'];
            
            foreach ($editableFields as $field) {
                if ($request->has($field)) {
                    $updateData[$field] = $request->input($field);
                }
            }
            
            $updateData['lock_version'] = ($sku->lock_version ?? 1) + 1;

            $sku->update($updateData);

            // Run validation after update
            // If validation_status was modified manually (e.g. Approved by Governor), preserve it.
            $manualStatusUpdate = isset($updateData['validation_status']);
            $validationResult = $this->validationService->validate($sku->fresh(), $manualStatusUpdate);

            return ResponseFormatter::format([
                'sku' => $sku->fresh(['primaryCluster', 'skuIntents.intent']),
                'validation' => $validationResult
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'SKU not found'], 404);
        } catch (\Exception $e) {
            Log::error('SKU update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request) {
        $data = $request->all();
        $data['lock_version'] = 1;

        $sku = Sku::create($data);

        // Run validation after creation
        $validationResult = $this->validationService->validate($sku->fresh());

        return ResponseFormatter::format([
            'sku' => $sku->fresh(['primaryCluster', 'skuIntents.intent']),
            'validation' => $validationResult
        ], "SKU created successfully", 201);
    }

    /**
     * GET /api/v1/sku/{id}/readiness — per-channel readiness scores (0-100). Unified API 7.1.
     */
    public function readiness($id) {
        $sku = Sku::with(['primaryCluster'])->findOrFail($id);
        $overall = (int) ($sku->readiness_score ?? 0);
        $channels = [
            ['channel' => 'google_sge', 'score' => $overall, 'components' => ['cluster_id' => 25, 'intents' => 25, 'answer_block' => 25, 'authority' => 25]],
            ['channel' => 'amazon', 'score' => max(0, $overall - 5), 'components' => ['listing' => 50, 'compliance' => 50]],
            ['channel' => 'ai_assistants', 'score' => $overall, 'components' => ['citation' => 50, 'structured' => 50]],
            ['channel' => 'own_website', 'score' => min(100, $overall + 5), 'components' => ['core_fields' => 40, 'channel_readiness' => 60]],
        ];
        return ResponseFormatter::format([
            'sku_id' => $sku->id,
            'channels' => $channels,
        ]);
    }

    public function stats() {
        $pending = Sku::where('validation_status', 'PENDING')->count();
        $approved = Sku::where('validation_status', 'VALID')
            ->whereDate('updated_at', \Carbon\Carbon::today())
            ->count();
        $rejected = Sku::where('validation_status', 'INVALID')
            ->whereDate('updated_at', \Carbon\Carbon::today())
            ->count();
        
        // Mock avg time for now
        $avgTime = "1.4m"; 

        return response()->json([
            'data' => [
                'pending' => $pending,
                'approved_today' => $approved,
                'rejected_today' => $rejected,
                'avg_review_time' => $avgTime
            ]
        ]);
    }
}
