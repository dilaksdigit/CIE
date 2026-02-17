<?php
namespace App\Validators\Gates;

use App\Models\Sku;
use App\Enums\GateType;
use App\Validators\GateResult;
use App\Validators\GateInterface;

class G4_AnswerBlockGate implements GateInterface
{
    public function validate(Sku $sku): GateResult
    {
        $answer = $sku->ai_answer_block ?? '';
        $len = strlen($answer);
        
        // Harvest SKUs have G4 suspended
        if ($sku->tier === 'HARVEST') {
            return new GateResult(
                gate: GateType::G4_VECTOR,
                passed: true,
                reason: 'G4 Suspended for Harvest tier.',
                blocking: false
            );
        }

        if ($len < 250) {
            return new GateResult(
                gate: GateType::G4_VECTOR,
                passed: false,
                reason: "Gate G4 Failed: Answer Block too short ({$len}/250 min).",
                blocking: true
            );
        }

        if ($len > 300) {
            return new GateResult(
                gate: GateType::G4_VECTOR,
                passed: false,
                reason: "Gate G4 Failed: Answer Block too long ({$len}/300 max).",
                blocking: true
            );
        }

        // Keyword check (stemmed)
        $primaryIntentNode = $sku->skuIntents->where('is_primary', true)->first();
        if ($primaryIntentNode) {
            $intent = strtolower($primaryIntentNode->intent->name ?? '');
            $keyword = $this->getStemmedKeyword($intent);
            
            if ($keyword && strpos(strtolower($answer), $keyword) === false) {
                return new GateResult(
                    gate: GateType::G4_VECTOR,
                    passed: false,
                    reason: "Gate G4 Failed: Answer Block must contain the Primary Intent keyword ('{$keyword}').",
                    blocking: true
                );
            }
        }

        return new GateResult(
            gate: GateType::G4_VECTOR,
            passed: true,
            reason: 'AI Answer Block meets length and keyword requirements.',
            blocking: false
        );
    }

    private function getStemmedKeyword(string $intent): string
    {
        switch ($intent) {
            case 'compatibility': return 'compat';
            case 'inspiration': return 'inspir';
            case 'problem-solving': return 'solut';
            case 'specification': return 'spec';
            case 'comparison': return 'compar';
            case 'installation': return 'install'; // Added
            case 'troubleshooting': return 'shoot'; // Added (troubleshoot/shooting)
            case 'regulatory': return 'safe'; // Added (regulatory/safety) - 'safe' is common root
            case 'replacement': return 'replac'; // Added (replace/replacement)
            default: return '';
        }
    }
}
