<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function showCatalog(string $categorySlug, string $productSlug): Response
    {
        return $this->showByType($categorySlug, $productSlug, ['hardware', 'accessory']);
    }

    public function showLaptop(string $categorySlug, string $productSlug): Response
    {
        return $this->showByType($categorySlug, $productSlug, ['laptop']);
    }

    public function legacy(Product $product): RedirectResponse
    {
        $product->loadMissing('category:id,name,type');
        $categorySlug = $this->categoryRouteSlug($product->category);
        $productSlug = $this->productRouteSlug($product);

        if ($product->category->type === 'laptop') {
            return redirect("/laptops/{$categorySlug}/{$productSlug}");
        }

        return redirect("/catalog/{$categorySlug}/{$productSlug}");
    }

    /**
     * @param  array<int, string>  $allowedTypes
     */
    private function showByType(string $categorySlug, string $productSlug, array $allowedTypes): Response
    {
        $categories = Category::query()
            ->whereIn('type', $allowedTypes)
            ->get(['id', 'name', 'type']);

        $category = $categories->first(
        fn(Category $item): bool => $this->categoryRouteSlug($item) === $categorySlug
        );
        abort_if($category === null, 404);

        $product = Product::query()
            ->where('category_id', $category->id)
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'is_component'])
            ->first(fn(Product $item): bool => $this->productRouteSlug($item) === $productSlug);
        abort_if($product === null, 404);

        $typeLabel = match ($category->type) {
                'hardware' => 'Hardware',
                'accessory' => 'Accessories',
                'laptop' => 'Laptops',
                default => 'Catalog',
            };

        $backToTypeHref = match ($category->type) {
                'hardware' => '/catalog/hardware',
                'accessory' => '/catalog/accessories',
                'laptop' => '/laptops',
                default => '/catalog',
            };

        $backToCategoryHref = $category->type === 'laptop'
            ? "/laptops/{$category->name}"
            : "/catalog/{$category->type}/{$category->name}";

        return Inertia::render('products/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price_in_cents' => $product->price_in_cents,
                'is_component' => (bool)$product->is_component,
            ],
            'category' => [
                'name' => $category->name,
                'label' => $this->headline($category->name),
                'type' => $category->type,
                'type_label' => $typeLabel,
                'route_slug' => $this->categoryRouteSlug($category),
            ],
            'navigation' => [
                'back_to_type_href' => $backToTypeHref,
                'back_to_category_href' => $backToCategoryHref,
            ],
        ]);
    }

    private function headline(string $value): string
    {
        return collect(explode('-', $value))
            ->map(fn(string $part): string => ucfirst($part))
            ->implode(' ');
    }

    private function categoryRouteSlug(Category $category): string
    {
        if ($category->type === 'laptop') {
            return Str::slug($category->name);
        }

        return Str::slug(Str::plural(str_replace('-', ' ', $category->name)));
    }

    private function productRouteSlug(Product $product): string
    {
        return Str::slug($product->description ?: $product->name);
    }
}