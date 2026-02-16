<?php
namespace App\Middleware;

use Closure;
use App\Models\Sku;
use App\Enums\TierType;

class TierLockMiddleware
{
    public function handle($request, Closure $next)
    {
        $skuId = $request->route('id');
        if (!$skuId) return $next($request);

        $sku = Sku::find($skuId);
        if (!$sku) return $next($request);

        // Hero and Support tiers have certain fields locked if they are already validated
        if (($sku->tier === TierType::HERO || $sku->tier === TierType::SUPPORT) && $sku->validation_status === 'VALID') {
            $lockedFields = ['title', 'primary_cluster_id', 'long_description'];
            foreach ($lockedFields as $field) {
                if ($request->has($field) && $request->input($field) !== $sku->$field) {
                    return response()->json([
                        'error' => "Field '$field' is locked for validated {$sku->tier->value} products."
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
