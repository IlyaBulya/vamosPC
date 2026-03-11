<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\OrderItem;
use App\Models\Product;
use App\Support\CartOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartItemController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $data = $request->validate([
            'product_id' => [
                'nullable',
                'integer',
                'exists:products,id',
                'required_without:configuration_id',
            ],
            'configuration_id' => [
                'nullable',
                'integer',
                'exists:configurations,id',
                'required_without:product_id',
            ],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        if (
            array_key_exists('product_id', $data)
            && array_key_exists('configuration_id', $data)
            && $data['product_id'] !== null
            && $data['configuration_id'] !== null
        ) {
            throw ValidationException::withMessages([
                'product_id' => 'Choose either product or configuration, not both.',
                'configuration_id' => 'Choose either configuration or product, not both.',
            ]);
        }

        $productId = isset($data['product_id']) ? (int) $data['product_id'] : null;
        $configurationId = isset($data['configuration_id']) ? (int) $data['configuration_id'] : null;
        $quantity = (int) ($data['quantity'] ?? 1);

        $order = CartOrder::ensureForUser($user);

        if ($productId !== null) {
            $product = Product::query()->findOrFail($productId);
            if (! $product->is_sellable) {
                throw ValidationException::withMessages([
                    'product_id' => 'This product is not available for direct purchase.',
                ]);
            }

            /** @var OrderItem|null $existingOrderItem */
            $existingOrderItem = $order->items()
                ->where('product_id', $productId)
                ->whereNull('configuration_id')
                ->first();

            if ($existingOrderItem !== null) {
                $existingOrderItem->update([
                    'qty' => min(99, ((int) $existingOrderItem->qty) + $quantity),
                    'price' => (int) $product->price_in_cents,
                ]);
            } else {
                $order->items()->create([
                    'product_id' => $productId,
                    'configuration_id' => null,
                    'qty' => $quantity,
                    'price' => (int) $product->price_in_cents,
                ]);
            }
        } elseif ($configurationId !== null) {
            $configuration = Configuration::query()->findOrFail($configurationId);

            /** @var OrderItem|null $existingOrderItem */
            $existingOrderItem = $order->items()
                ->where('configuration_id', $configurationId)
                ->whereNull('product_id')
                ->first();

            if ($existingOrderItem !== null) {
                $existingOrderItem->update([
                    'qty' => min(99, ((int) $existingOrderItem->qty) + $quantity),
                    'price' => (int) $configuration->price,
                ]);
            } else {
                $order->items()->create([
                    'product_id' => null,
                    'configuration_id' => $configurationId,
                    'qty' => $quantity,
                    'price' => (int) $configuration->price,
                ]);
            }
        }

        CartOrder::syncTotal($order);

        return back();
    }

    public function update(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $order = $orderItem->order;
        abort_unless(
            $order !== null
            && (int) $order->user_id === (int) $user->id
            && (string) $order->status === CartOrder::STATUS,
            404,
        );

        $orderItem->update([
            'qty' => (int) $data['quantity'],
        ]);

        CartOrder::syncTotal($order);

        return back();
    }

    public function destroy(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $order = $orderItem->order;
        abort_unless(
            $order !== null
            && (int) $order->user_id === (int) $user->id
            && (string) $order->status === CartOrder::STATUS,
            404,
        );

        $orderItem->delete();
        CartOrder::syncTotal($order);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $order = CartOrder::activeForUser($user);

        if ($order !== null) {
            $order->items()->delete();
            $order->update(['total' => 0]);
        }

        return back();
    }
}
