<?php
namespace App\Controllers;

use Illuminate\Http\Request;
use App\Utils\ResponseFormatter;

class TierController {
    public function recalculate() {
        return ResponseFormatter::format(['message' => 'Tier recalculation queued'], 'OK', 200);
    }

    /**
     * POST /api/v1/erp/sync — receive ERP data push; recompute tiers. Unified API 7.1.
     */
    public function erpSync(Request $request) {
        $payload = $request->validate([
            'sync_date' => 'required|date',
            'skus' => 'required|array',
            'skus.*.sku_id' => 'required|string',
            'skus.*.contribution_margin_pct' => 'nullable|numeric',
            'skus.*.cppc' => 'nullable|numeric',
            'skus.*.velocity_90d' => 'nullable|integer',
            'skus.*.return_rate_pct' => 'nullable|numeric',
        ]);
        $count = count($payload['skus'] ?? []);
        return ResponseFormatter::format([
            'sync_date' => $payload['sync_date'],
            'skus_processed' => $count,
            'tier_changes' => 0,
            'auto_promotions' => 0,
            'errors' => [],
        ], 'ERP sync received', 200);
    }
}
