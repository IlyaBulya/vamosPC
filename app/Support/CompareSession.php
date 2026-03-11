<?php

namespace App\Support;

use Illuminate\Http\Request;

class CompareSession
{
    public const SESSION_KEY = 'compare.builds';

    /**
     * @return list<string>
     */
    public static function all(Request $request): array
    {
        /** @var mixed $raw */
        $raw = $request->session()->get(self::SESSION_KEY, []);

        if (! is_array($raw)) {
            return [];
        }

        return collect($raw)
            ->filter(fn ($slug): bool => is_string($slug) && $slug !== '')
            ->map(fn ($slug): string => (string) $slug)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  list<string>  $builds
     */
    public static function put(Request $request, array $builds): void
    {
        $request->session()->put(self::SESSION_KEY, array_values(array_unique($builds)));
    }

    public static function count(Request $request): int
    {
        return count(self::all($request));
    }

    public static function has(Request $request, string $slug): bool
    {
        return in_array($slug, self::all($request), true);
    }

    public static function add(Request $request, string $slug): void
    {
        $builds = self::all($request);
        $builds[] = $slug;

        self::put($request, $builds);
    }

    public static function remove(Request $request, string $slug): void
    {
        $builds = collect(self::all($request))
            ->reject(fn (string $item): bool => $item === $slug)
            ->values()
            ->all();

        self::put($request, $builds);
    }

    public static function clear(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }
}
