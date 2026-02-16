<?php
namespace App\Validators\Gates;
use App\Models\Sku;
use App\Enums\GateType;
use App\Enums\TierType;
use App\Validators\GateResult;
use App\Validators\GateInterface;
class G7_ExpertGate implements GateInterface
{
 public function validate(Sku $sku): GateResult
 {
 $isBlocking = in_array($sku->tier, [TierType::HERO, TierType::SUPPORT]);
 $missing = [];
 if (!$sku->expert_author) {
 $missing[] = 'Expert author';
 }
 if (!$sku->expert_credentials) {
 $missing[] = 'Expert credentials';
 }
 if (!$sku->review_date || strtotime($sku->review_date) < strtotime('-1 year')) {
 $missing[] = 'Recent review (within 1 year)';
 }
 
 if (count($missing) > 0) {
 return new GateResult(
 gate: GateType::G7_EXPERT,
 passed: false,
 reason: 'Missing expert authority fields: ' . implode(', ', $missing) .
 ($isBlocking ? ' (REQUIRED for ' . $sku->tier->value . ' tier)' : ' (warning only)'),
 blocking: $isBlocking
 );
 }
 
 return new GateResult(
 gate: GateType::G7_EXPERT,
 passed: true,
 reason: sprintf('Expert authority confirmed (author: %s, reviewed: %s)',
 $sku->expert_author, $sku->review_date),
 blocking: false
 );
 }
}
