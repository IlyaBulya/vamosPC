<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['products.category:id,name'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->products->count(),
                'components' => $configuration->products
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category_name' => $product->category?->name,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('store/gaming-pcs', [
            'configurations' => $configurations,
        ]);
    }

    public function configure(Configuration $configuration): Response
    {
        $configuration->load(['products.category:id,name']);

        $baseProducts = $configuration->products->values();
        $categoryIds = $baseProducts
            ->pluck('category_id')
            ->filter()
            ->map(fn ($categoryId): int => (int) $categoryId)
            ->unique()
            ->values();

        $optionsByCategoryId = Product::query()
            ->with(['category:id,name'])
            ->where('is_component', true)
            ->whereIn('category_id', $categoryIds)
            ->orderBy('category_id')
            ->orderBy('name')
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'color'])
            ->groupBy('category_id');

        $slots = $baseProducts
            ->groupBy(fn (Product $product): string => $product->category_id !== null
                ? 'cat-'.$product->category_id
                : 'uncategorized')
            ->flatMap(function ($groupedProducts, string $categoryKey) use ($optionsByCategoryId) {
                /** @var Product|null $firstProduct */
                $firstProduct = $groupedProducts->first();
                $categoryId = $firstProduct?->category_id !== null
                    ? (int) $firstProduct->category_id
                    : null;
                $categoryName = $firstProduct?->category?->name ?? 'Uncategorized';
                $slotCount = $groupedProducts->count();

                $categoryOptions = $categoryId !== null
                    ? ($optionsByCategoryId->get($categoryId) ?? collect())
                    : collect();

                if ($categoryOptions->isEmpty()) {
                    $categoryOptions = $groupedProducts;
                }

                $products = $categoryOptions
                    ->map(fn (Product $product): array => [
                        'id' => (int) $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price_in_cents' => (int) $product->price_in_cents,
                        'color' => $product->color,
                        'category_name' => $product->category?->name,
                    ])
                    ->values()
                    ->all();

                return $groupedProducts
                    ->values()
                    ->map(fn (Product $baseProduct, int $index): array => [
                        'slot_key' => "{$categoryKey}-{$index}",
                        'slot_label' => $slotCount > 1
                            ? "{$categoryName} #".($index + 1)
                            : $categoryName,
                        'category_id' => $categoryId,
                        'category_name' => $categoryName,
                        'default_product_id' => (int) $baseProduct->id,
                        'products' => $products,
                    ])
                    ->all();
            })
            ->values();

        $baseComponentsTotal = (int) $baseProducts->sum(
            fn (Product $product): int => (int) $product->price_in_cents,
        );

        return Inertia::render('store/configure-pc', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'base_components_total_in_cents' => $baseComponentsTotal,
                'markup_in_cents' => (int) $configuration->price - $baseComponentsTotal,
            ],
            'slots' => $slots,
        ]);
    }
}
