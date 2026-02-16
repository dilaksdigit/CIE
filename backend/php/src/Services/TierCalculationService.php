<?php
namespace App\Services;
use App\Models\Sku;
use App\Enums\TierType;
use Illuminate\Support\Collection;
class TierCalculationService
{
 private const PROFITABILITY_THRESHOLD = 5.0; // 5% margin
 private const PERCENTILE_TOP = 20; // Top 20%
 
 public function recalculateAllTiers(): array
 {
 $allSkus = Sku::where('tier', '!=', TierType::KILL)->get();
 $marginPercentile = $this->calculatePercentile($allSkus, 'margin_percent', self::PERCENTILE_TOP);
 $volumePercentile = $this->calculatePercentile($allSkus, 'annual_volume', self::PERCENTILE_TOP);
 $changes = [];
 foreach ($allSkus as $sku) {
 $oldTier = $sku->tier;
 $newTier = $this->calculateTierForSku($sku, $marginPercentile, $volumePercentile);
 if ($oldTier !== $newTier) {
 $this->updateSkuTier($sku, $oldTier, $newTier);
 $changes[] = [
 'sku_id' => $sku->id,
 'sku_code' => $sku->sku_code,
 'old_tier' => $oldTier->value,
 'new_tier' => $newTier->value,
 'margin' => $sku->margin_percent,
 'volume' => $sku->annual_volume
 ];
 }
 }
 return $changes;
 }
 
 private function calculateTierForSku(Sku $sku, float $marginPercentile, int $volumePercentile): TierType
 {
 if ($sku->strategic_hero) { return TierType::HERO; }
 if ($this->shouldBeKilled($sku)) { return TierType::KILL; }
 if ($sku->margin_percent >= $marginPercentile && $sku->annual_volume >= $volumePercentile) { return TierType::HERO; }
 if ($sku->margin_percent >= self::PROFITABILITY_THRESHOLD) { return TierType::SUPPORT; }
 if ($sku->margin_percent > 0) { return TierType::HARVEST; }
 return TierType::KILL;
 }
 
 private function shouldBeKilled(Sku $sku): bool
 {
 if ($sku->margin_percent <= 0) { return true; }
 if ($sku->last_sale_date && strtotime($sku->last_sale_date) < strtotime('-90 days')) { return true; }
 if ($sku->annual_volume === 0) { return true; }
 return false;
 }
 
 private function calculatePercentile(Collection $skus, string $field, int $percentile): float|int
 {
 $values = $skus->pluck($field)->filter()->sort()->values();
 if ($values->isEmpty()) { return 0; }
 $index = (int) ceil($values->count() * ((100 - $percentile) / 100));
 return $values[$index] ?? $values->last();
 }
 
 private function updateSkuTier(Sku $sku, TierType $oldTier, TierType $newTier): void
 {
 $rationale = sprintf(
 'Margin: %.1f%%, Volume: %d units',
 $sku->margin_percent,
 $sku->annual_volume
 );
 $sku->update(['tier' => $newTier, 'tier_rationale' => $rationale]);
 \App\Models\TierHistory::create([
 'sku_id' => $sku->id,
 'old_tier' => $oldTier,
 'new_tier' => $newTier,
 'reason' => $rationale,
 'margin_percent' => $sku->margin_percent,
 'annual_volume' => $sku->annual_volume,
 'changed_by' => auth()->id()
 ]);
 }
}
