<?php
namespace App\Controllers;

use App\Services\ValidationService;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class ValidationController {
    protected $service;

    public function __construct(ValidationService $service) {
        $this->service = $service;
    }

    public function validate($id) {
        $result = $this->service->validateSku($id);

        // Log validation action
        AuditLog::create([
            'entity_type' => 'sku',
            'entity_id'   => $id,
            'action'      => 'validate',
            'field_name'  => null,
            'old_value'   => null,
            'new_value'   => json_encode([
                'status'   => $result['status'] ?? null,
                'valid'    => $result['valid'] ?? null,
            ]),
            'actor_id'    => auth()->id() ?? 'SYSTEM',
            'actor_role'  => auth()->user()->role->name ?? 'system',
            'ip_address'  => request()->ip(),
            'user_agent'  => request()->userAgent(),
            'timestamp'   => now(),
        ]);

        return ResponseFormatter::format($result);
    }
}
