<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\CartSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $lines = collect(CartSession::all($request));
        abort_if($lines->isEmpty(), 422, 'Cart is empty.');

        $productIds = $lines
            ->filter(fn (array $line): bool => $line['type'] === 'product')
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->all();

        $products = Product::query()
            ->where('is_sellable', true)
            ->whereIn('id', $productIds)
            ->get(['id', 'price_in_cents'])
            ->keyBy('id');

        $items = $lines->map(function (array $line) use ($products): ?array {
            $product = $products->get($line['id']);

            if (! $product) {
                return null;
            }

            return [
                'product_id' => (int) $product->id,
                'qty' => (int) $line['quantity'],
                'price' => (int) $product->price_in_cents,
            ];
        });

        abort_if($items->contains(null), 422, 'Cart contains invalid items.');

        /** @var \Illuminate\Support\Collection<int, array{product_id:int, qty:int, price:int}> $resolvedItems */
        $resolvedItems = $items;

        DB::transaction(function () use ($resolvedItems, $user): void {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'total' => $resolvedItems->sum(fn (array $item): int => $item['price'] * $item['qty']),
                'status' => 'pending',
                'discount_in_cents' => 0,
            ]);

            foreach ($resolvedItems as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }
        });

        CartSession::forget($request);

        return redirect()
            ->route('cart')
            ->with('status', 'Checkout completed successfully.');
    }
}
