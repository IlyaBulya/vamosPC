<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\CartOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $cartOrder = $user->orders()
            ->where('status', CartOrder::STATUS)
            ->with([
                'items.product:id,category_id,name,description,price_in_cents,stock',
                'items.product.category:id,name,type',
                'items.configuration:id,name,description,image,price',
            ])
            ->latest('id')
            ->first();

        $invalidOrderItemIds = [];

        $items = collect();

        if ($cartOrder !== null) {
            $items = $cartOrder->items->map(function (OrderItem $orderItem) use (&$invalidOrderItemIds): ?array {
                if ($orderItem->product !== null) {
                    $product = $orderItem->product;
                    $category = $product->category;

                    if ($category === null) {
                        $invalidOrderItemIds[] = $orderItem->id;
                        return null;
                    }

                    $categorySlug = $this->categoryRouteSlug($category);
                    $productSlug = $this->productRouteSlug($product);
                    $href = $category->type === 'laptop'
                        ? "/laptops/{$categorySlug}/{$productSlug}"
                        : "/catalog/{$categorySlug}/{$productSlug}";

                    return [
                        'line_key' => (string) $orderItem->id,
                        'id' => (int) $product->id,
                        'item_type' => 'product',
                        'name' => $product->name,
                        'subtitle' => $product->description,
                        'availability' => $product->stock > 0 ? 'In stock' : 'Pre-order',
                        'unit_price_in_cents' => (int) $orderItem->price,
                        'qty' => (int) $orderItem->qty,
                        'href' => $href,
                    ];
                }

                if ($orderItem->configuration !== null) {
                    $configuration = $orderItem->configuration;

                    return [
                        'line_key' => (string) $orderItem->id,
                        'id' => (int) $configuration->id,
                        'item_type' => 'configuration',
                        'name' => $configuration->name,
                        'subtitle' => $configuration->description,
                        'availability' => 'In stock',
                        'unit_price_in_cents' => (int) $orderItem->price,
                        'qty' => (int) $orderItem->qty,
                        'href' => '/gaming-pcs',
                    ];
                }

                $invalidOrderItemIds[] = $orderItem->id;

                return null;
            })->filter()->values();

            if ($invalidOrderItemIds !== []) {
                OrderItem::query()
                    ->whereIn('id', $invalidOrderItemIds)
                    ->delete();
            }

            CartOrder::syncTotal($cartOrder);
        }

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
