<?php

namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule($schedule): void
    {
        // CIE v2.3.2: Run decay escalation weekly after AI audit (e.g. Monday 06:00)
        $schedule->command('decay:run')->weeklyOn(1, '06:00');
        // PHP-native: read ai_audit_runs/ai_audit_results, increment zeros, create brief at week 3
        $schedule->command('cie:decay-check')->weeklyOn(1, '06:30');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
