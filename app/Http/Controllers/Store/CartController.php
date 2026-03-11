<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\CartSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $cartItems = collect(CartSession::all($request));

        $products = Product::query()
            ->with('category:id,name,type')
            ->whereIn(
                'id',
                $cartItems
                    ->filter(fn (array $line): bool => $line['type'] === 'product')
                    ->pluck('id')
                    ->all(),
            )
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'stock'])
            ->keyBy('id');

        $items = $cartItems
            ->map(function (array $line, string $lineKey) use ($products): ?array {
                /** @var Product|null $product */
                $product = $products->get($line['id']);
                if (! $product || ! $product->category) {
                    return null;
                }

                $categorySlug = $this->categoryRouteSlug($product->category);
                $productSlug = $this->productRouteSlug($product);
                $href = $product->category->type === 'laptop'
                    ? "/laptops/{$categorySlug}/{$productSlug}"
                    : "/catalog/{$categorySlug}/{$productSlug}";

                return [
                    'line_key' => $lineKey,
                    'id' => $product->id,
                    'name' => $product->name,
                    'subtitle' => $product->description,
                    'availability' => $product->stock > 0 ? 'In stock' : 'Pre-order',
                    'unit_price_in_cents' => (int) $product->price_in_cents,
                    'qty' => (int) $line['quantity'],
                    'href' => $href,
                ];
            })
            ->filter()
            ->values();

        $normalizedItems = $items
            ->mapWithKeys(fn (array $item): array => [
                $item['line_key'] => [
                    'type' => 'product',
                    'id' => $item['id'],
                    'quantity' => $item['qty'],
                ],
            ])
            ->all();
        CartSession::put($request, $normalizedItems);

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
        return Str::slug($product->name).'-'.$product->id;
    }
}
