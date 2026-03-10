<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use App\Support\CartSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartItemController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'configuration_id' => ['nullable', 'integer', 'exists:configurations,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $productId = isset($data['product_id']) ? (int) $data['product_id'] : 0;
        $configurationId = isset($data['configuration_id']) ? (int) $data['configuration_id'] : 0;
        $quantity = (int) ($data['quantity'] ?? 1);
        abort_if(($productId > 0) === ($configurationId > 0), 422, 'Provide exactly one cart item type.');

        $items = CartSession::all($request);

        if ($productId > 0) {
            $lineKey = CartSession::lineKey('product', $productId);
            $items[$lineKey] = [
                'type' => 'product',
                'id' => $productId,
                'quantity' => ($items[$lineKey]['quantity'] ?? 0) + $quantity,
            ];
        }

        if ($configurationId > 0) {
            $user = $request->user();
            abort_unless($user !== null, 403);

            $configuration = Configuration::query()
                ->where('user_id', $user->id)
                ->findOrFail($configurationId);

            $lineKey = CartSession::lineKey('configuration', $configuration->id);
            $items[$lineKey] = [
                'type' => 'configuration',
                'id' => $configuration->id,
                'quantity' => ($items[$lineKey]['quantity'] ?? 0) + $quantity,
            ];
        }

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
