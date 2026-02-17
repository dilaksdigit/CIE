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

            // Determine final status
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

            // Optionally run Python vector validation if cluster assigned
            $vectorValidation = null;
            if ($sku->primary_cluster_id) {
                $vectorValidation = $this->validateVector($sku);
                
                // If vector validation fails with blocking, adjust status
                if (!($vectorValidation['valid'] ?? true) && ($vectorValidation['blocking'] ?? false)) {
                    if ($status === ValidationStatus::VALID) {
                        $status = ValidationStatus::DEGRADED;
                        $isDegraded = true;
                        $nextAction = "Vector similarity below threshold. Publication blocked pending validation.";
                    }
                }
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
                'results' => $validationResults['results'] ?? [],
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

    /**
     * Validate SKU vector against cluster
     */
    private function validateVector(Sku $sku): array
    {
        try {
            $result = $this->pythonClient->validateVector(
                description: $sku->description ?? '',
                clusterId: (string)$sku->primary_cluster_id,
                skuId: $sku->id
            );

            $threshold = env('SIMILARITY_THRESHOLD', 0.72);
            $valid = ($result['similarity'] ?? 0) >= $threshold;

            return array_merge($result, [
                'gate' => 'G5_VECTOR',
                'valid' => $valid,
                'blocking' => !$valid,
                'reason' => $valid 
                    ? "Vector similarity {$result['similarity']} meets threshold {$threshold}"
                    : "Vector similarity {$result['similarity']} below threshold {$threshold}"
            ]);
        } catch (\Exception $e) {
            Log::error("Vector validation failed: {$e->getMessage()}");
            return [
                'gate' => 'G5_VECTOR',
                'valid' => false,
                'blocking' => false, // Fail-soft: don't block on service errors
                'reason' => 'Vector validation unavailable (service degradation)',
                'similarity' => 0
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
