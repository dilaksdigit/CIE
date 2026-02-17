<?php
namespace App\Controllers;

use App\Models\AuditResult;
use App\Models\Sku;
use App\Services\PythonWorkerClient;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AuditLog;

class AuditController {
    private $pythonClient;

    public function __construct(PythonWorkerClient $pythonClient) {
        $this->pythonClient = $pythonClient;
    }

    public function runAudit(Request $request, $sku_id) {
        $sku = Sku::findOrFail($sku_id);

        // Queue the audit job in Python worker
        $queueResult = $this->pythonClient->queueAudit($sku_id);

        if (!($queueResult['queued'] ?? false)) {
            Log::warning("Failed to queue audit for SKU {$sku_id}", $queueResult);

            AuditLog::create([
                'entity_type' => 'audit',
                'entity_id'   => $sku_id,
                'action'      => 'audit_run',
                'field_name'  => null,
                'old_value'   => null,
                'new_value'   => 'queued_failed',
                'actor_id'    => auth()->id() ?? 'SYSTEM',
                'actor_role'  => auth()->user()->role->name ?? 'system',
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
                'timestamp'   => now(),
            ]);
            // Fail-soft: return pending state even if Python is down
            return ResponseFormatter::format([
                'sku_id' => $sku_id,
                'status' => 'initiated',
                'audit_id' => $queueResult['audit_id'] ?? bin2hex(random_bytes(8)),
                'message' => 'Audit queued (service degradation mode)'
            ], "Audit initiated for SKU {$sku_id}", 202);
        }

        Log::info("Audit queued for SKU {$sku_id}", ['audit_id' => $queueResult['audit_id'] ?? 'unknown']);

        AuditLog::create([
            'entity_type' => 'audit',
            'entity_id'   => $sku_id,
            'action'      => 'audit_run',
            'field_name'  => null,
            'old_value'   => null,
            'new_value'   => 'queued',
            'actor_id'    => auth()->id() ?? 'SYSTEM',
            'actor_role'  => auth()->user()->role->name ?? 'system',
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'timestamp'   => now(),
        ]);

        return ResponseFormatter::format([
            'sku_id' => $sku_id,
            'status' => 'queued',
            'audit_id' => $queueResult['audit_id'] ?? bin2hex(random_bytes(8)),
            'message' => 'Audit has been queued and will run on the next worker cycle'
        ], "Audit initiated for SKU {$sku_id}", 202);
    }

    public function history($sku_id) {
        // Return audit history for a specific SKU
        $results = AuditResult::where('sku_id', $sku_id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return ResponseFormatter::format($results);
    }

    /**
     * Get audit result (for polling)
     */
    public function getResult($auditId) {
        $result = $this->pythonClient->getAuditResult($auditId);
        
        if ($result['status'] === 'pending' || $result['status'] === 'error') {
            return ResponseFormatter::format($result, 'Audit result', $result['status'] === 'error' ? 500 : 202);
        }

        return ResponseFormatter::format($result);
    }
}
