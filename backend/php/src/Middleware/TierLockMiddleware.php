<?php
namespace App\Middleware;
use Closure;
use Illuminate\Http\Request;
use App\Models\Sku;
use App\Enums\TierType;
class TierLockMiddleware
{
 private const LOCKED_FIELDS_HARVEST = ['title', 'short_description', 'primary_image', 'gallery_images'];
 private const LOCKED_FIELDS_KILL = ['title', 'short_description', 'long_description', 'meta_title', 'meta_description', 'primary_image', 'gallery_images', 'specifications', 'expert_author', 'expert_credentials'];
 
 public function handle(Request $request, Closure $next)
 {
 if (!in_array($request->method(), ['PUT', 'PATCH'])) { return $next($request); }
 $skuId = $request->route('id');
 $sku = Sku::findOrFail($skuId);
 $lockedFields = match($sku->tier) {
 TierType::HARVEST => self::LOCKED_FIELDS_HARVEST,
 TierType::KILL => self::LOCKED_FIELDS_KILL,
 default => []
 };
 if (empty($lockedFields)) { return $next($request); }
 $attemptedChanges = array_intersect(array_keys($request->all()), $lockedFields);
 if (!empty($attemptedChanges)) {
 return response()->json([
 'error' => 'Field modification not allowed',
 'message' => sprintf('Fields [%s] are locked for %s tier SKUs.', implode(', ', $attemptedChanges), $sku->tier->value),
 'locked_fields' => $lockedFields,
 'tier' => $sku->tier->value,
 'next_action' => 'Contact Finance to upgrade tier or edit other fields'
 ], 403);
 }
 return $next($request);
 }
}
