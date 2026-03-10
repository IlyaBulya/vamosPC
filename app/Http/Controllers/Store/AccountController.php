<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $user->loadCount(['orders', 'configurations']);

        $orders = $user->orders()
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

        $configurations = $user->configurations()
            ->with('baseProduct:id,name')
            ->withCount('products')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($configuration): array => [
                'id' => $configuration->id,
                'name' => (string) $configuration->name,
                'description' => $configuration->description,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => (int) $configuration->products_count,
                'base_product_name' => $configuration->baseProduct?->name,
                'created_at' => $configuration->created_at?->toDateString(),
            ])
            ->values();

        return Inertia::render('account/index', [
            'stats' => [
                'orders_count' => (int) $user->orders_count,
                'configurations_count' => (int) $user->configurations_count,
                'security_level' => $user->two_factor_confirmed_at ? 'Advanced' : 'Basic',
            ],
            'orders' => $orders,
            'configurations' => $configurations,
        ]);
    }
}
