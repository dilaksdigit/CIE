<?php
namespace App\Validators\Gates;
use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;
class G5_TechnicalGate implements GateInterface
{
 public function validate(Sku $sku): GateResult
 {
 $cluster = $sku->primaryCluster;
 if (!$cluster) {
 return new GateResult(
 gate: GateType::G5_TECHNICAL,
 passed: false,
 reason: 'No cluster assigned. Cannot validate technical specs.',
 blocking: true
 );
 }
 
 $requiredSpecs = $cluster->required_specifications ?? [];
 $skuSpecs = $sku->specifications ?? [];
 
 $missing = [];
 foreach ($requiredSpecs as $specName) {
 if (!isset($skuSpecs[$specName]) || empty($skuSpecs[$specName])) {
 $missing[] = $specName;
 }
 }
 
 if (count($missing) > 0) {
 return new GateResult(
 gate: GateType::G5_TECHNICAL,
 passed: false,
 reason: 'Missing required specifications: ' . implode(', ', $missing),
 blocking: true
 );
 }
 
 $unitIssues = $this->validateUnits($skuSpecs);
 if (count($unitIssues) > 0) {
 return new GateResult(
 gate: GateType::G5_TECHNICAL,
 passed: false,
 reason: 'Unit format issues: ' . implode(', ', $unitIssues),
 blocking: true
 );
 }
 
 return new GateResult(
 gate: GateType::G5_TECHNICAL,
 passed: true,
 reason: sprintf('All %d required specifications completed with valid units',
 count($requiredSpecs)),
 blocking: false
 );
 }
 
 private function validateUnits(array $specs): array
 {
 $issues = [];
 $standardUnits = ['lbs', 'kg', 'oz', 'g', 'in', 'cm', 'ft', 'm', 'mm'];
 foreach ($specs as $name => $value) {
 if (preg_match('/\d+\s*([a-zA-Z]+)/', (string)$value, $matches)) {
 $unit = strtolower($matches[1]);
 if (!in_array($unit, $standardUnits)) {
 $issues[] = sprintf('%s: use standard units (found "%s")', $name, $unit);
 }
 }
 }
 return $issues;
 }
}
