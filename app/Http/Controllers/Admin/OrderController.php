<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\CartOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    private const STATUSES = [
        'pending',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled',
    ];

    public function index(): Response
    {
        $orders = Order::query()
            ->where('status', '!=', CartOrder::STATUS)
            ->with(['user:id,name,email', 'items.product:id,name', 'items.configuration:id,name'])
            ->latest()
            ->get()
            ->map(function (Order $order): array {
                $items = $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'name' => $item->product?->name ?? $item->configuration?->name ?? 'Unknown item',
                    'kind' => $item->configuration_id !== null ? 'Configuration' : 'Product',
                    'qty' => (int) $item->qty,
                    'price_in_cents' => (int) $item->price,
                ])->values();

                return [
                    'id' => $order->id,
                    'user_name' => $order->user?->name ?? 'Unknown user',
                    'user_email' => $order->user?->email ?? 'unknown@example.com',
                    'status' => (string) $order->status,
                    'total_in_cents' => (int) $order->total,
                    'discount_in_cents' => (int) $order->discount_in_cents,
                    'created_at' => $order->created_at?->toDateTimeString(),
                    'items' => $items,
                ];
            })
            ->values();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
        ]);

        $order->update([
            'status' => $data['status'],
        ]);

        return back()->with('status', 'Order status updated successfully.');
    }
}
