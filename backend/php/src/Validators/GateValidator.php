<?php
namespace App\Validators;
use App\Models\Sku;
use App\Enums\ValidationStatus;
use App\Validators\Gates\G1_BasicInfoGate;
use App\Validators\Gates\G2_IntentGate;
use App\Validators\Gates\G3_SecondaryIntentGate;
use App\Validators\Gates\G4_AnswerBlockGate;
use App\Validators\Gates\G5_TechnicalGate;
use App\Validators\Gates\G6_CommercialPolicyGate;
use App\Validators\Gates\G7_ExpertGate;
class GateValidator
{
 private array $gates = [
 G1_BasicInfoGate::class,
  G2_IntentGate::class,
  G3_SecondaryIntentGate::class,
  G4_AnswerBlockGate::class,
 G5_TechnicalGate::class,
  G6_CommercialPolicyGate::class,
 G7_ExpertGate::class,
 ];
 
 public function validateAll(Sku $sku, bool $preserveStatus = false): array
 {
 $results = [];
 $overallPassed = true;
 $isDegraded = false;
 $blockingFailure = null;
 
  foreach ($this->gates as $gateClass) {
  $gate = new $gateClass();
 $result = $gate->validate($sku);
 $results[] = $result;
 
 // Log the gate check
 \App\Models\ValidationLog::create([
 'sku_id' => $sku->id,
 'gate_type' => $result->gate,
 'passed' => $result->passed,
 'reason' => $result->reason,
 'is_blocking' => $result->blocking,
 'similarity_score' => $result->metadata['similarity'] ?? null,
  'validated_by' => (function_exists('auth') && app()->bound('auth') && auth()->check()) ? auth()->id() : null
 ]);
 
 if (!$result->passed) {
 if ($result->blocking) {
 $overallPassed = false;
 if (!$blockingFailure) {
 $blockingFailure = $result;
 }
 }
 if ($result->metadata['degraded'] ?? false) {
 $isDegraded = true;
 }
 }
 }
 
 if ($overallPassed) {
 $status = ValidationStatus::VALID;
 $canPublish = true;
 $nextAction = 'SKU is ready for publication';
 } elseif ($isDegraded) {
 $status = ValidationStatus::DEGRADED;
 $canPublish = false;
 $nextAction = 'Save allowed but publication blocked. Validation will retry automatically.';
 } else {
 $status = ValidationStatus::INVALID;
 $canPublish = false;
 $nextAction = $blockingFailure ? $blockingFailure->reason : 'Fix validation errors before publication';
 }
 
        // Patch: If status is PENDING (submitted for review), do not overwrite it with automated status
        // We still run validation to get the results, but we keep the PENDING state for the queue.
        $currentStatus = $sku->fresh()->validation_status;
        
        $updateData = [
            'can_publish' => $canPublish,
            'last_validated_at' => now(),
            'ai_validation_pending' => $isDegraded
        ];

        if (!$preserveStatus && $currentStatus !== ValidationStatus::PENDING) {
            $updateData['validation_status'] = $status;
        }

        $sku->update($updateData);
 
 return [
 'sku_id' => $sku->id,
 'overall_status' => $status->value,
 'can_publish' => $canPublish,
 'gates' => array_map(fn($r) => $r->toArray(), $results),
 'next_action' => $nextAction
 ];
 }
}
