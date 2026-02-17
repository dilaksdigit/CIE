<?php
namespace App\Validators\Gates;

use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;

class G2_IntentGate implements GateInterface
{
    private const TAXONOMY = [
        'Compatibility',
        'Inspiration',
        'Problem-Solving',
        'Specification',
        'Comparison',
        'Installation', // Added
        'Troubleshooting', // Added
        'Regulatory', // Added - Mapped from Regulatory / Safety
        'Replacement' // Added - Mapped from Replacement / Refill
    ];

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
        // Case-insensitive check
        $taxonomyLow = array_map('strtolower', self::TAXONOMY);
        if (!in_array(strtolower($intentName), $taxonomyLow)) {
            return new GateResult(
                gate: GateType::G2_IMAGES,
                passed: false,
                reason: "Gate G2 Failed: Intent '{$intentName}' not in approved taxonomy (Test 4.2 requirement).",
                blocking: true
            );
        }

        return new GateResult(
            gate: GateType::G2_IMAGES,
            passed: true,
            reason: "Primary Intent '{$intentName}' validated.",
            blocking: false
        );
    }
}
