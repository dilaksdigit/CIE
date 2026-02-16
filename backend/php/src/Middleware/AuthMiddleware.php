<?php
namespace App\Middleware;
class AuthMiddleware {
    public function handle($request, $next) { return $next($request); }
}
