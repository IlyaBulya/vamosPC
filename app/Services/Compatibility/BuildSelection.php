<?php

namespace App\Services\Compatibility;

use App\Enums\ComponentType;
use App\Models\Product;
use Illuminate\Support\Collection;

/**
 * The set of products a build consists of — one entry per physical unit,
 * so a slot with quantity 2 contributes its product twice.
 */
final class BuildSelection
{
    /** @var Collection<int, Product> */
    private Collection $products;

    /**
     * @param  iterable<Product>  $products
     */
    public function __construct(iterable $products)
    {
        $this->products = Collection::make($products)->values();
    }

    /**
     * @return Collection<int, Product>
     */
    public function all(): Collection
    {
        return $this->products;
    }

    /**
     * @return Collection<int, Product>
     */
    public function ofType(ComponentType $type): Collection
    {
        return $this->products
            ->filter(fn (Product $product): bool => $product->component_type === $type)
            ->values();
    }

    public function firstOfType(ComponentType $type): ?Product
    {
        return $this->ofType($type)->first();
    }
}
