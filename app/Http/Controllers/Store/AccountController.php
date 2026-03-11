<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Support\CartOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $user->loadCount([
            'orders as completed_orders_count' => fn ($query) => $query->where('status', '!=', CartOrder::STATUS),
        ]);

        $orders = $user->orders()
            ->where('status', '!=', CartOrder::STATUS)
            ->with('items:id,order_id,qty')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($order): array => [
                'id' => $order->id,
                'status' => (string) $order->status,
                'total_in_cents' => (int) $order->total,
                'items_count' => (int) $order->items->sum('qty'),
                'created_at' => $order->created_at?->toDateString(),
            ])
            ->values();

        return Inertia::render('account/index', [
            'stats' => [
                'orders_count' => (int) $user->completed_orders_count,
                'security_level' => $user->two_factor_confirmed_at ? 'Advanced' : 'Basic',
            ],
            'orders' => $orders,
        ]);
    }
}
