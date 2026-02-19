<?php
namespace App\Services;

use App\Models\Sku;
use App\Models\ValidationLog;
use App\Enums\ValidationStatus;
use App\Validators\GateValidator;
use Illuminate\Support\Facades\Log;

class ValidationService
{
    protected $validator;
    private $pythonClient;

    public function __construct(GateValidator $validator, PythonWorkerClient $pythonClient)
    {
        $this->validator = $validator;
        $this->pythonClient = $pythonClient;
    }

    /**
     * Full validation pipeline for a SKU
     */
    public function validate(Sku $sku, bool $preserveStatus = false): array
    {
        Log::info("Starting validation for SKU {$sku->id}", ['sku_code' => $sku->sku_code]);

        try {
            // Run GateValidator which orchestrates all gates (G1-G7)
            $validationResults = $this->validator->validateAll($sku, $preserveStatus);
            
            // Check if overall validation passed
            $isPassed = $validationResults['overall_passed'] ?? false;
            $isDegraded = $validationResults['is_degraded'] ?? false;
            $blockingFailure = $validationResults['blocking_failure'] ?? null;

            // Vector result comes from GateValidator (G5_VECTOR gate) — no duplicate call
            $gates = $validationResults['gates'] ?? [];
            $vectorValidation = null;
            foreach ($gates as $g) {
                $gateKey = $g['gate'] ?? '';
                if ($gateKey === 'G5_VECTOR' || $gateKey === 'G4_VECTOR') {
                    $vectorValidation = [
                        'gate' => $gateKey,
                        'valid' => $g['passed'] ?? false,
                        'blocking' => $g['blocking'] ?? true,
                        'reason' => $g['reason'] ?? '',
                        'similarity' => $g['metadata']['similarity'] ?? 0,
                    ];
                    break;
                }
            }

            // Determine final status (already incorporates gate results including vector)
            if ($blockingFailure) {
                $status = ValidationStatus::INVALID;
                $nextAction = "Fix validation errors before publication";
            } elseif ($isDegraded) {
                $status = ValidationStatus::DEGRADED;
                $nextAction = "Save allowed but publication blocked. Validation will retry automatically.";
            } else {
                $status = ValidationStatus::VALID;
                $nextAction = "Ready for publication";
            }

            // Log the validation result
            $validationLog = ValidationLog::create([
                'sku_id' => $sku->id,
                'user_id' => auth()->id() ?? null,
                'validation_status' => $status,
                'results_json' => json_encode(array_merge($validationResults, ['vector' => $vectorValidation])),
                'passed' => $status === ValidationStatus::VALID,
            ]);

            Log::info("Validation complete for SKU {$sku->id}", [
                'status' => $status,
                'validation_log_id' => $validationLog->id
            ]);

            return [
                'valid' => $status === ValidationStatus::VALID,
                'status' => $status,
                'validation_log_id' => $validationLog->id,
                'results' => $validationResults['gates'] ?? $validationResults['results'] ?? [],
                'next_action' => $nextAction,
                'ai_validation_pending' => $isDegraded,
                'blocking_failure' => $blockingFailure,
                'vector_validation' => $vectorValidation,
            ];
        } catch (\Exception $e) {
            Log::error("Validation failed for SKU {$sku->id}: {$e->getMessage()}");
            
            return [
                'valid' => false,
                'status' => ValidationStatus::INVALID,
                'next_action' => 'Validation service error',
                'error' => $e->getMessage(),
            ];
        }
    }

    public function validateSku($id)
    {
        $sku = Sku::findOrFail($id);
        return $this->validate($sku);
    }

    /**
     * Patch 2: AI Audit Quorum Rules
     * Advances or pauses decay based on engine availability.
     */
    public function evaluateAuditQuorum(Sku $sku, array $engineResults): string
    {
        $successCount = collect($engineResults)->where('status', 'SUCCESS')->count();
        $sku->update(['last_audit_quorum' => $successCount]);

        if ($successCount >= 3) {
            return 'ADVANCE'; // 3/4 engines = Advance decay timer
        } elseif ($successCount == 2) {
            return 'PAUSE';   // 2/4 engines = Scores recorded, decay PAUSED
        } else {
            return 'FREEZE';  // <=1 engine = Run FAILED, decay FROZEN
        }
    }
}
