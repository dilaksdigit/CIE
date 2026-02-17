<?php

namespace App\Validators\Gates;

use App\Models\Sku;
use App\Models\IntentTaxonomy;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;

class G2_IntentGate implements GateInterface
{
    public function validate(Sku $sku): GateResult
    {
        $primaryIntent = $sku->skuIntents->where('is_primary', true)->first();

        if (!$primaryIntent) {
            return new GateResult(
                gate: GateType::G2_IMAGES,
                passed: false,
                reason: 'Gate G2 Failed: Primary Intent required.',
                blocking: true
            );
        }

        $intentName = $primaryIntent->intent->name ?? '';

        // Look up in canonical intent_taxonomy (label + intent_key)
        $taxonomyMatch = IntentTaxonomy::query()
            ->whereRaw('LOWER(label) = ?', [strtolower($intentName)])
            ->orWhereRaw('LOWER(intent_key) = ?', [strtolower(str_replace(' ', '_', $intentName))])
            ->first();

        if (!$taxonomyMatch) {
            return new GateResult(
                gate: GateType::G2_IMAGES,
                passed: false,
                reason: "Gate G2 Failed: Intent '{$intentName}' not in locked 9-intent taxonomy.",
                blocking: true
            );
        }

        return new GateResult(
            gate: GateType::G2_IMAGES,
            passed: true,
            reason: "Primary Intent '{$intentName}' validated against canonical taxonomy.",
            blocking: false
        );
    }
}
