<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/gaming-pc', [
            'builds' => $this->demoBuilds(),
        ]);
    }

    public function configurator(string $build): Response
    {
        $selectedBuild = collect($this->demoBuilds())
            ->firstWhere('slug', $build);

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

    /**
     * @return list<array{slug:string, name:string, specs:string, price_label:string, base_price_in_cents:int}>
     */
    private function demoBuilds(): array
    {
        return [
            [
                'slug' => 'starter-core',
                'name' => 'Starter Core',
                'specs' => 'Intel Core i5 / RTX 4060 / 16GB RAM / 1TB SSD',
                'price_label' => 'from EUR 1,299',
                'base_price_in_cents' => 129900,
            ],
            [
                'slug' => 'performance-x',
                'name' => 'Performance X',
                'specs' => 'AMD Ryzen 7 / RTX 5070 / 32GB RAM / 2TB SSD',
                'price_label' => 'from EUR 2,199',
                'base_price_in_cents' => 219900,
            ],
            [
                'slug' => 'ultra-apex',
                'name' => 'Ultra Apex',
                'specs' => 'Intel Core i9 / RTX 5090 / 64GB RAM / 4TB SSD',
                'price_label' => 'from EUR 3,999',
                'base_price_in_cents' => 399900,
            ],
        ];
    }
}
