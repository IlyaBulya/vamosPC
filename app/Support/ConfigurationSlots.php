<?php

namespace App\Support;

use App\Models\Configuration;
use App\Models\Product;

class ConfigurationSlots
{
    /**
     * Regenerate a configuration's slots from its attached component
     * products (the legacy configuration_product pivot). Deterministic:
     * ordered by canonical component-type order, then category, then
     * product id, with "#N" labels when a category appears more than once.
     *
     * Temporary bridge until the admin slot editor manages slots directly.
     *
     * @param  array<int, int>  $quantities  product id => units per build
     */
    public static function rebuildFromProducts(Configuration $configuration, array $quantities = []): void
    {
        $configuration->load(['products.category:id,name']);

        $products = $configuration->products
            ->sortBy([
                fn (Product $a, Product $b): int => ($a->component_type?->sortOrder() ?? 999)
                    <=> ($b->component_type?->sortOrder() ?? 999),
                fn (Product $a, Product $b): int => ((int) $a->category_id) <=> ((int) $b->category_id),
                fn (Product $a, Product $b): int => ((int) $a->id) <=> ((int) $b->id),
            ])
            ->values();

        $countsByCategory = $products->countBy(
            fn (Product $product): int => (int) $product->category_id,
        );
        $seenByCategory = [];

        $configuration->slots()->delete();

        foreach ($products as $position => $product) {
            $categoryKey = (int) $product->category_id;
            $seenByCategory[$categoryKey] = ($seenByCategory[$categoryKey] ?? 0) + 1;

            $categoryName = $product->category?->name ?? 'Uncategorized';
            $label = ($countsByCategory[$categoryKey] ?? 1) > 1
                ? "{$categoryName} #{$seenByCategory[$categoryKey]}"
                : $categoryName;

            $configuration->slots()->create([
                'component_type' => $product->component_type,
                'label' => $label,
                'quantity' => max(1, (int) ($quantities[(int) $product->id] ?? 1)),
                'default_product_id' => (int) $product->id,
                'is_required' => true,
                'sort_order' => ($position + 1) * 10,
            ]);
        }
    }
}
