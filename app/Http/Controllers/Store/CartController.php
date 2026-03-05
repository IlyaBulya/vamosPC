<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var array<int|string, int|string> $rawItems */
        $rawItems = (array) $request->session()->get('cart.items', []);

        $cartItems = collect($rawItems)
            ->mapWithKeys(
                fn ($qty, $productId): array => [(int) $productId => max((int) $qty, 1)],
            )
            ->filter(fn (int $qty, int $productId): bool => $productId > 0 && $qty > 0);

        $products = Product::query()
            ->with('category:id,name,type')
            ->whereIn('id', $cartItems->keys()->all())
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'stock'])
            ->keyBy('id');

        $items = $cartItems
            ->map(function (int $qty, int $productId) use ($products): ?array {
                /** @var Product|null $product */
                $product = $products->get($productId);
                if (!$product) {
                    return null;
                }

                $category = $product->category;
                if (!$category) {
                    return null;
                }

                $categorySlug = $this->categoryRouteSlug($category);
                $productSlug = $this->productRouteSlug($product);
                $href = $category->type === 'laptop'
                    ? "/laptops/{$categorySlug}/{$productSlug}"
                    : "/catalog/{$categorySlug}/{$productSlug}";

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'subtitle' => $product->description,
                    'availability' => $product->stock > 0 ? 'In stock' : 'Pre-order',
                    'unit_price_in_cents' => (int) $product->price_in_cents,
                    'qty' => $qty,
                    'href' => $href,
                ];
            })
            ->filter()
            ->values();

        $normalizedItems = $items
            ->mapWithKeys(fn (array $item): array => [$item['id'] => $item['qty']])
            ->all();
        $request->session()->put('cart.items', $normalizedItems);

        return Inertia::render('store/cart', [
            'items' => $items,
        ]);
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
