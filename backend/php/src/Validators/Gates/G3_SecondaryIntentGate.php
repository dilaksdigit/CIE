<?php
namespace App\Validators\Gates;

use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;

class G3_SecondaryIntentGate implements GateInterface
{
    public function validate(Sku $sku): GateResult
    {
        $primaryIntentNode = $sku->skuIntents->where('is_primary', true)->first();
        $primaryIntentName = $primaryIntentNode->intent->name ?? '';
        
        $secondaryIntents = $sku->skuIntents->where('is_primary', false);
        $count = $secondaryIntents->count();

        // 1. Uniqueness check (Secondary cannot match Primary)
        foreach ($secondaryIntents as $si) {
            if ($si->intent->name === $primaryIntentName) {
                return new GateResult(
                    gate: GateType::G3_SECONDARY_INTENT,
                    passed: false,
                    reason: "Gate G3 Failed: Secondary intent cannot match Primary ('{$primaryIntentName}').",
                    blocking: true
                );
            }
        }

        // 2. Hero/Support minimum requirement
        if (in_array($sku->tier, ['HERO', 'SUPPORT']) && $count < 1) {
            return new GateResult(
                gate: GateType::G3_SECONDARY_INTENT,
                passed: false,
                reason: "Gate G3 Failed: Hero/Support SKUs require minimum 1 secondary intent.",
                blocking: true
            );
        }

        // 3. Tier-specific maximums (Hero: 3, Support: 2, Harvest: 1, Kill: 0)
        if ($sku->tier === 'HERO' && $count > 3) {
            return new GateResult(
                gate: GateType::G3_SECONDARY_INTENT,
                passed: false,
                reason: "Gate G3 Failed: Hero-tier SKUs allow maximum 3 secondary intents. Found: {$count}.",
                blocking: true
            );
        }

        if ($sku->tier === 'SUPPORT' && $count > 2) {
            return new GateResult(
                gate: GateType::G3_SECONDARY_INTENT,
                passed: false,
                reason: "Gate G3 Failed: Support-tier SKUs allow maximum 2 secondary intents. Found: {$count}.",
                blocking: true
            );
        }

        if ($sku->tier === 'HARVEST' && $count > 1) {
            return new GateResult(
                gate: GateType::G3_SECONDARY_INTENT,
                passed: false,
                reason: "Gate G3 Failed: Harvest-tier SKUs allow maximum 1 secondary intent. Found: {$count}.",
                blocking: true
            );
        }

        if ($sku->tier === 'KILL' && $count > 0) {
            return new GateResult(
                gate: GateType::G3_SECONDARY_INTENT,
                passed: false,
                reason: "Gate G3 Failed: Kill-tier SKUs may not have any secondary intents.",
                blocking: true
            );
        }

        return new GateResult(
            gate: GateType::G3_SECONDARY_INTENT,
            passed: true,
            reason: "{$count} Secondary Intents validated.",
            blocking: false
        );
    }
}
