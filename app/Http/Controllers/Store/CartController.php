<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserConfiguration;
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
                'items.product:id,category_id,name,description,image,price_in_cents,stock',
                'items.product.category:id,name,type',
                'items.userConfiguration:id,base_configuration_id,name,description,image,price,meta',
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
                        'image' => $product->image,
                        'availability' => $product->stock > 0 ? 'In stock' : 'Pre-order',
                        'unit_price_in_cents' => (int) $orderItem->price,
                        'qty' => (int) $orderItem->qty,
                        'href' => $href,
                        'extras' => null,
                    ];
                }

                if ($orderItem->userConfiguration !== null) {
                    $userConfiguration = $orderItem->userConfiguration;
                    $href = $userConfiguration->base_configuration_id !== null
                        ? "/gaming-pcs/{$userConfiguration->base_configuration_id}/configure"
                        : '/gaming-pcs';

                    return [
                        'line_key' => (string) $orderItem->id,
                        'id' => (int) $userConfiguration->id,
                        'item_type' => 'user_configuration',
                        'name' => $userConfiguration->name,
                        'subtitle' => $userConfiguration->description,
                        'image' => $userConfiguration->image,
                        'availability' => 'In stock',
                        'unit_price_in_cents' => (int) $orderItem->price,
                        'qty' => (int) $orderItem->qty,
                        'href' => $href,
                        'extras' => $this->configurationExtras($userConfiguration),
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

    /**
     * Return only the safe add-on snapshot fields needed by the cart UI.
     *
     * @return array{
     *     software: array<int, array<string, mixed>>,
     *     accessories: array<int, array<string, mixed>>,
     *     total_in_cents: int
     * }|null
     */
    private function configurationExtras(UserConfiguration $configuration): ?array
    {
        $softwareSnapshots = data_get($configuration->meta, 'selected_software', []);
        $accessorySnapshots = data_get($configuration->meta, 'selected_accessories', []);

        $software = collect(is_array($softwareSnapshots) ? $softwareSnapshots : [])
            ->filter(fn (mixed $snapshot): bool => is_array($snapshot))
            ->map(fn (array $snapshot): array => [
                'group_key' => (string) ($snapshot['group_key'] ?? ''),
                'group_label' => (string) ($snapshot['group_label'] ?? 'Software'),
                'option_id' => (string) ($snapshot['option_id'] ?? ''),
                'name' => (string) ($snapshot['name'] ?? 'Software'),
                'price_in_cents' => max(0, (int) ($snapshot['price_in_cents'] ?? 0)),
            ])
            ->filter(fn (array $snapshot): bool => $snapshot['option_id'] !== '')
            ->values();

        $accessories = collect(is_array($accessorySnapshots) ? $accessorySnapshots : [])
            ->filter(fn (mixed $snapshot): bool => is_array($snapshot))
            ->map(fn (array $snapshot): array => [
                'product_id' => (int) ($snapshot['product_id'] ?? 0),
                'category_slug' => (string) ($snapshot['category_slug'] ?? ''),
                'category_label' => (string) ($snapshot['category_label'] ?? 'Accessory'),
                'name' => (string) ($snapshot['name'] ?? 'Accessory'),
                'price_in_cents' => max(0, (int) ($snapshot['price_in_cents'] ?? 0)),
            ])
            ->filter(fn (array $snapshot): bool => $snapshot['product_id'] > 0)
            ->values();

        if ($software->isEmpty() && $accessories->isEmpty()) {
            return null;
        }

        return [
            'software' => $software->all(),
            'accessories' => $accessories->all(),
            'total_in_cents' => (int) $software->sum('price_in_cents')
                + (int) $accessories->sum('price_in_cents'),
        ];
    }
}
