<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ((int) $request->user()->role_id !== 1) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        return $next($request);
    }
}
