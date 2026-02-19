<?php
namespace App\Services;

use App\Models\Sku;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

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
        // Patch 2: Decay frozen/paused by quorum rules
        if ($quorumStatus === 'FREEZE' || $quorumStatus === 'PAUSE') {
            return false;
        }

        // Any non-zero citation score self-heals the decay counter & status
        if ($citationScore > 0) {
            $sku->update([
                'decay_weeks'             => 0,
                'decay_consecutive_zeros' => 0,
                'decay_status'            => 'none',
            ]);

            return true;
        }

        // Advance decay (consecutive zero weeks)
        $newZeros = (int) ($sku->decay_consecutive_zeros ?? 0) + 1;

        // Map to canonical decay_status
        if ($newZeros === 1) {
            $status = 'yellow_flag';
        } elseif ($newZeros === 2) {
            $status = 'alert';
        } elseif ($newZeros === 3) {
            $status = 'auto_brief';
        } elseif ($newZeros >= 4) {
            $status = 'escalated';
        } else {
            $status = 'none';
        }

        $sku->update([
            'decay_weeks'             => $newZeros, // keep legacy field in sync
            'decay_consecutive_zeros' => $newZeros,
            'decay_status'            => $status,
        ]);

        $this->handleDecayEscalation($sku, $newZeros, $status);

        return true;
    }

    private function handleDecayEscalation(Sku $sku, int $weeks, string $status): void
    {
        switch ($status) {
            case 'yellow_flag':
                $this->notify($sku, 'yellow_flag', "Citation zero in week 1. Monitoring.");
                break;
            case 'alert':
                $this->notify($sku, 'alert', "Citation alert! Week 2 with zero visibility.");
                break;
            case 'auto_brief':
                $this->generateAutoBrief($sku);
                $this->notify($sku, 'info', "Auto-brief generated due to 3-week citation decay.");
                break;
            case 'escalated':
                $this->notify($sku, 'error', "CRITICAL: Citation decay escalated to Tier-overseer for {$sku->sku_code} after {$weeks} zero weeks.");
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
        $brief = \App\Models\ContentBrief::create([
            'sku_id' => $sku->id,
            'brief_type' => 'DECAY_REFRESH',
            'title' => 'Auto-brief: 3-week citation decay – ' . ($sku->title ?? $sku->sku_code ?? $sku->id),
            'description' => '3-Week Citation Decay (Auto-generated). Refresh answer block and authority content.',
            'status' => 'OPEN',
        ]);

        // Queue brief generation in Python worker so actual brief content is produced
        $pythonUrl = rtrim(env('PYTHON_API_URL', 'http://python-worker:5000'), '/');
        try {
            $client = new \GuzzleHttp\Client(['timeout' => 5.0]);
            $response = $client->post($pythonUrl . '/queue/brief-generation', [
                'json' => [
                    'sku_id' => $sku->id,
                    'title'  => $sku->title ?? $sku->sku_code ?? 'SKU',
                ],
            ]);
            $body = json_decode($response->getBody()->getContents(), true);
            Log::info('Auto-brief queued for SKU after 3-week decay', [
                'sku_id' => $sku->id,
                'sku_code' => $sku->sku_code,
                'brief_id' => $brief->id ?? null,
                'queued' => $body['queued'] ?? false,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue auto-brief for SKU ' . $sku->id . ': ' . $e->getMessage());
        }

        // Log brief_generated in audit_log
        try {
            AuditLog::create([
                'entity_type' => 'brief',
                'entity_id'   => $sku->id,
                'action'      => 'brief_generated',
                'field_name'  => null,
                'old_value'   => null,
                'new_value'   => 'auto_decay_brief',
                'user_id'     => null,
                'ip_address'  => null,
                'user_agent'  => null,
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            // Fail-soft if audit_log columns differ
        }
    }
}
