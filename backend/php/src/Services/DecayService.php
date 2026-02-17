<?php
namespace App\Services;

use App\Models\Sku;
use App\Models\Notification;

class DecayService
{
    /**
     * Patch 3: Citation Decay Self-Healing Loop
     * Week 1 zero = yellow_flag
     * Week 2 = alert
     * Week 3 = auto_brief generated
     * Week 4 = escalated
     */
    public function processWeeklyDecay(Sku $sku, int $citationScore, string $quorumStatus): bool
    {
        if ($quorumStatus === 'FREEZE' || $quorumStatus === 'PAUSE') {
            return false; // Patch 2: Decay frozen/paused by quorum rules
        }

        if ($citationScore > 0) {
            $sku->update(['decay_weeks' => 0]); // Self-healed
            return true;
        }

        $newDecayWeeks = $sku->decay_weeks + 1;
        $sku->update(['decay_weeks' => $newDecayWeeks]);

        $this->handleDecayEscalation($sku, $newDecayWeeks);

        return true;
    }

    private function handleDecayEscalation(Sku $sku, int $weeks): void
    {
        switch ($weeks) {
            case 1:
                $this->notify($sku, 'yellow_flag', "Citation zero in week 1. Monitoring.");
                break;
            case 2:
                $this->notify($sku, 'alert', "Citation alert! Week 2 with zero visibility.");
                break;
            case 3:
                $this->generateAutoBrief($sku);
                $this->notify($sku, 'info', "Auto-brief generated due to 3-week citation decay.");
                break;
            case 4:
                $this->notify($sku, 'error', "CRITICAL: Citation decay escalated to Tier-overseer for {$sku->sku_code}.");
                break;
        }
    }

    private function notify(Sku $sku, string $type, string $message): void
    {
        // Integration with NotificationService (Assumed mock for now)
        \Log::info("Decay Escalation: [{$type}] {$message}", ['sku_id' => $sku->id]);
    }

    private function generateAutoBrief(Sku $sku): void
    {
        // Logic to generate content refresh brief with competitor answers
        \App\Models\ContentBrief::create([
            'sku_id' => $sku->id,
            'type' => 'REFRESH',
            'reason' => '3-Week Citation Decay (Auto-generated)',
            'status' => 'DRAFT'
        ]);
    }
}
