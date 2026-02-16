<?php
namespace App\Middleware;

use Closure;
use Illuminate\Http\Request;

class RBACMiddleware
{
    public function handle(Request $request, Closure $next, ...$allowedRoles)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user = auth()->user();
        
        // Ensure user has role loaded
        if (!$user->role) {
            return response()->json(['error' => 'Forbidden - No role assigned'], 403);
        }

        $userRole = strtoupper($user->role->name);
        $allowedRoles = array_map('strtoupper', $allowedRoles);

        if (!in_array($userRole, $allowedRoles) && !in_array('ADMIN', $userRole === 'ADMIN' ? ['ADMIN'] : $allowedRoles)) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => "This action requires one of these roles: " . implode(', ', $allowedRoles)
            ], 403);
        }

        return $next($request);
    }
}
