<?php
namespace App\Validators\Gates;
use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;
class G4_VectorGate implements GateInterface
{
 private const PYTHON_ENDPOINT = 'http://python-worker:5000/validate-vector';
 
 public function validate(Sku $sku): GateResult
 {
 if (!$sku->primary_cluster_id) {
 return new GateResult(
 gate: GateType::G4_VECTOR,
 passed: false,
 reason: 'No cluster assigned. SKU must belong to at least one cluster.',
 blocking: true
 );
 }
 
 if (!$sku->long_description || strlen(trim($sku->long_description)) < 100) {
 return new GateResult(
 gate: GateType::G4_VECTOR,
 passed: false,
 reason: 'Long description missing or too short (minimum 100 characters required for vector validation).',
 blocking: true
 );
 }
 
 try {
 $response = $this->callPythonValidator($sku->long_description, $sku->primary_cluster_id);
 
 if ($response['valid']) {
 return new GateResult(
 gate: GateType::G4_VECTOR,
 passed: true,
 reason: sprintf('Semantic match confirmed (similarity: %.2f)', $response['similarity']),
 blocking: false,
 metadata: ['similarity' => $response['similarity']]
 );
 } else {
 return new GateResult(
 gate: GateType::G4_VECTOR,
 passed: false,
 reason: $response['reason'],
 blocking: true,
 metadata: ['similarity' => $response['similarity']]
 );
 }
 
 } catch (\Exception $e) {
 return new GateResult(
 gate: GateType::G4_VECTOR,
 passed: false,
 reason: 'Vector validation temporarily unavailable. Save allowed with DEGRADED status.',
 blocking: false,
 metadata: ['degraded' => true, 'error' => $e->getMessage()]
 );
 }
 }
 
 private function callPythonValidator(string $description, string $clusterId): array
 {
 $client = new \GuzzleHttp\Client(['timeout' => 3.0]);
 $response = $client->post(self::PYTHON_ENDPOINT, [
 'json' => [
 'description' => $description,
 'cluster_id' => $clusterId
 ]
 ]);
 return json_decode($response->getBody()->getContents(), true);
 }
}
