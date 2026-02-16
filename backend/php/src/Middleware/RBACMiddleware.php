<?php
namespace App\Middleware;
use Closure;
use Illuminate\Http\Request;
class RBACMiddleware
{
 public function handle(Request $request, Closure $next, ...$allowedRoles)
 {
 if (!auth()->check()) { return response()->json(['error' => 'Unauthenticated'], 401); }
 $user = auth()->user();
 $userRoles = $user->roles->pluck('name')->toArray();
 $hasPermission = !empty(array_intersect($userRoles, $allowedRoles));
 if (!$hasPermission) {
 return response()->json([
 'error' => 'Forbidden',
 'message' => sprintf('This action requires one of these roles: %s. Your roles: %s', implode(', ', $allowedRoles), implode(', ', $userRoles)),
 'required_roles' => $allowedRoles,
 'your_roles' => $userRoles
 ], 403);
 }
 return $next($request);
 }
}
