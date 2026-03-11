<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\CompareSession;
use App\Support\DemoGamingBuilds;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('store/gaming-pc', [
            'builds' => DemoGamingBuilds::all(),
            'compareSlugs' => CompareSession::all($request),
        ]);
    }

    public function configurator(string $build): Response
    {
        $selectedBuild = DemoGamingBuilds::find($build);

        abort_unless(is_array($selectedBuild), 404);

        $sections = Category::query()
            ->where('type', 'hardware')
            ->with([
                'products' => fn ($query) => $query
                    ->where('is_available_for_configuration', true)
                    ->orderBy('name')
                    ->select([
                        'id',
                        'category_id',
                        'name',
                        'description',
                        'price_in_cents',
                        'stock',
                        'color',
                    ]),
            ])
            ->orderBy('id')
            ->get(['id', 'name', 'description'])
            ->filter(fn (Category $category): bool => $category->products->isNotEmpty())
            ->map(function (Category $category): array {
                return [
                    'id' => $category->id,
                    'key' => $category->name,
                    'label' => Str::headline(str_replace('-', ' ', $category->name)),
                    'description' => $category->description,
                    'products' => $category->products
                        ->map(fn (Product $product): array => [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price_in_cents' => (int) $product->price_in_cents,
                            'stock' => (int) $product->stock,
                            'color' => $product->color,
                        ])
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('store/gaming-pc-configurator', [
            'build' => $selectedBuild,
            'sections' => $sections,
        ]);
    }
}
