<?php
namespace App\Controllers;

use App\Models\AuditResult;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;

class AuditController {
    public function runAudit(Request $request, $sku_id) {
        // In a real system, this would trigger the Python worker
        // For now, we'll return a mock success
        return ResponseFormatter::format([
            'sku_id' => $sku_id,
            'status' => 'initiated',
            'audit_id' => bin2hex(random_bytes(8))
        ], "Audit initiated for SKU $sku_id");
    }

    public function history($sku_id) {
        // Return audit history for a specific SKU
        return ResponseFormatter::format([]);
    }
}
