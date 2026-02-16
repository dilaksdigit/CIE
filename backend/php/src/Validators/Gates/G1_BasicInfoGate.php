<?php
namespace App\Validators\Gates;
use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;
class G1_BasicInfoGate implements GateInterface
{
 public function validate(Sku $sku): GateResult
 {
 $missing = [];
 
 if (!$sku->sku_code || strlen(trim($sku->sku_code)) === 0) {
 $missing[] = 'SKU code';
 }
 
 if (!$sku->title || strlen(trim($sku->title)) === 0) {
 $missing[] = 'Title';
 }
 
 if (!$sku->short_description || strlen(trim($sku->short_description)) < 50) {
 $missing[] = 'Short description (min 50 characters)';
 }
 
 if (count($missing) > 0) {
 return new GateResult(
 gate: GateType::G1_BASIC_INFO,
 passed: false,
 reason: 'Missing required fields: ' . implode(', ', $missing),
 blocking: true
 );
 }
 
 return new GateResult(
 gate: GateType::G1_BASIC_INFO,
 passed: true,
 reason: 'All required basic information fields are present',
 blocking: false
 );
 }
}
