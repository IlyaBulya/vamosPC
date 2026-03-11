<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\CartSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartItemController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $productId = (int) $data['product_id'];
        $quantity = (int) ($data['quantity'] ?? 1);

        $items = CartSession::all($request);

        $product = Product::query()->findOrFail($productId);
        if (! $product->is_sellable) {
            throw ValidationException::withMessages([
                'product_id' => 'This product is not available for direct purchase.',
            ]);
        }

        $lineKey = CartSession::lineKey('product', $productId);
        $items[$lineKey] = [
            'type' => 'product',
            'id' => $productId,
            'quantity' => ($items[$lineKey]['quantity'] ?? 0) + $quantity,
        ];

        CartSession::put($request, $items);

        return back();
    }

    public function update(Request $request, string $lineKey): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $items = CartSession::all($request);
        $line = CartSession::parseLineKey($lineKey);

        abort_if($line === null, 404);
        abort_unless(isset($items[$lineKey]), 404);

        $items[$lineKey]['quantity'] = (int) $data['quantity'];

        CartSession::put($request, $items);

        return back();
    }

    public function destroy(Request $request, string $lineKey): RedirectResponse
    {
        $items = CartSession::all($request);
        $line = CartSession::parseLineKey($lineKey);

        abort_if($line === null, 404);

        unset($items[$lineKey]);
        CartSession::put($request, $items);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        CartSession::forget($request);

        return back();
    }
}
