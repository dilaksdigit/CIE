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
                    gate: GateType::G3_SEO,
                    passed: false,
                    reason: "Gate G3 Failed: Secondary intent cannot match Primary ('{$primaryIntentName}').",
                    blocking: true
                );
            }
        }

        // 2. Hero/Support minimum requirement
        if (in_array($sku->tier, ['HERO', 'SUPPORT']) && $count < 1) {
             return new GateResult(
                gate: GateType::G3_SEO,
                passed: false,
                reason: "Gate G3 Failed: Hero/Support SKUs require minimum 1 secondary intent.",
                blocking: true
            );
        }

        // 3. Maximum 3 check
        if ($count > 3) {
            return new GateResult(
                gate: GateType::G3_SEO,
                passed: false,
                reason: "Gate G3 Failed: Maximum 3 secondary intents allowed. Found: {$count}.",
                blocking: true
            );
        }

        return new GateResult(
            gate: GateType::G3_SEO,
            passed: true,
            reason: "{$count} Secondary Intents validated.",
            blocking: false
        );
    }
}
