<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

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
        $items = $this->cartItems($request);

        $items[$productId] = ($items[$productId] ?? 0) + $quantity;
        $request->session()->put('cart.items', $items);

        return back();
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $items = $this->cartItems($request);
        $items[$product->id] = (int) $data['quantity'];
        $request->session()->put('cart.items', $items);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $items = $this->cartItems($request);
        unset($items[$product->id]);
        $request->session()->put('cart.items', $items);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $request->session()->forget('cart.items');

        return back();
    }

    /**
     * @return array<int, int>
     */
    private function cartItems(Request $request): array
    {
        /** @var mixed $raw */
        $raw = $request->session()->get('cart.items', []);

        if (!is_array($raw)) {
            return [];
        }

        $items = [];
        foreach ($raw as $productId => $qty) {
            $id = (int) $productId;
            $quantity = (int) $qty;
            if ($id > 0 && $quantity > 0) {
                $items[$id] = $quantity;
            }
        }

        return $items;
    }
}

