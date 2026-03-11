<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Support\CompareSession;
use App\Support\DemoGamingBuilds;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompareItemController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'build' => ['required', 'string', Rule::in(DemoGamingBuilds::slugs())],
        ]);

        $build = (string) $data['build'];

        if (! CompareSession::has($request, $build)) {
            CompareSession::add($request, $build);
        }

        return back();
    }

    public function destroy(Request $request, string $build): RedirectResponse
    {
        abort_unless(in_array($build, DemoGamingBuilds::slugs(), true), 404);

        CompareSession::remove($request, $build);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        CompareSession::clear($request);

        return back();
    }
}
