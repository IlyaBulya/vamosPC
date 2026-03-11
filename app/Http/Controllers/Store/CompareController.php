<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Support\CompareSession;
use App\Support\DemoGamingBuilds;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompareController extends Controller
{
    public function index(Request $request): Response
    {
        $builds = collect(CompareSession::all($request))
            ->map(fn (string $slug): ?array => DemoGamingBuilds::find($slug))
            ->filter()
            ->values();

        return Inertia::render('store/compare', [
            'builds' => $builds,
        ]);
    }
}
