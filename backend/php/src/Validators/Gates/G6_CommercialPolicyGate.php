<?php
namespace App\Validators\Gates;

use App\Models\Sku;
use App\Enums\GateType;
use App\Enums\TierType;
use App\Validators\GateResult;
use App\Validators\GateInterface;

class G6_CommercialPolicyGate implements GateInterface
{
    public function validate(Sku $sku): GateResult
    {
        // G6.1: Tier-locked intent fields (Page 2)
        if ($sku->tier === TierType::KILL) {
            return new GateResult(
                gate: GateType::G6_COMMERCIAL,
                passed: false,
                reason: 'Gate G6 Failed: KILL-tier SKUs must have zero effort. Any edit is a policy violation.',
                blocking: true
            );
        }

        if ($sku->tier === TierType::HARVEST) {
            $secondaryIntents = $sku->skuIntents->where('is_primary', false)->count();
            if ($secondaryIntents > 0) {
                 return new GateResult(
                    gate: GateType::G6_COMMERCIAL,
                    passed: false,
                    reason: 'Gate G6 Failed: Harvest-tier SKUs restricted to Specification intent only (Requirement 1.2).',
                    blocking: true
                );
            }
        }

        return new GateResult(
            gate: GateType::G6_COMMERCIAL,
            passed: true,
            reason: 'Commercial tier and effort policy aligned.',
            blocking: false
        );
    }
}
