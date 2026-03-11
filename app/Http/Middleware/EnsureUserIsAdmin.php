<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $isHardcodedAdmin = $user !== null && (int) $user->id === 2;
        $isFlaggedAdmin = $user !== null && (bool) ($user->is_admin ?? false);

        abort_unless($isHardcodedAdmin || $isFlaggedAdmin, 403);

        return $next($request);
    }
}
