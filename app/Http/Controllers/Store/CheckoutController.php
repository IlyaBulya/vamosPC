<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\CartOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        DB::transaction(function () use ($user): void {
            /** @var Order|null $order */
            $order = Order::query()
                ->where('user_id', $user->id)
                ->where('status', CartOrder::STATUS)
                ->with([
                    'items.product:id,price_in_cents,is_sellable',
                    'items.configuration:id,price',
                ])
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            abort_if($order === null, 422, 'Cart is empty.');
            abort_if($order->items->isEmpty(), 422, 'Cart is empty.');

            $total = $order->items->sum(function (OrderItem $item): int {
                if ($item->product_id !== null) {
                    $product = $item->product;
                    abort_if($product === null || ! $product->is_sellable, 422, 'Cart contains unavailable products.');

                    $unitPrice = (int) $product->price_in_cents;

                    if ((int) $item->price !== $unitPrice) {
                        $item->update(['price' => $unitPrice]);
                    }

                    return $unitPrice * (int) $item->qty;
                }

                if ($item->configuration_id !== null) {
                    $configuration = $item->configuration;
                    abort_if($configuration === null, 422, 'Cart contains invalid configurations.');

                    $unitPrice = (int) $configuration->price;

                    if ((int) $item->price !== $unitPrice) {
                        $item->update(['price' => $unitPrice]);
                    }

                    return $unitPrice * (int) $item->qty;
                }

                abort(422, 'Cart contains invalid items.');
            });

            $order->update([
                'status' => 'pending',
                'total' => (int) $total,
                'discount_in_cents' => 0,
            ]);
        });

        return redirect()
            ->route('cart')
            ->with('status', 'Checkout completed successfully.');
    }
}
