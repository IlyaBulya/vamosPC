<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\CartOrder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recentOrders = Order::query()
            ->where('status', '!=', CartOrder::STATUS)
            ->with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'user_name' => $order->user?->name ?? 'Unknown user',
                'status' => (string) $order->status,
                'total_in_cents' => (int) $order->total,
                'created_at' => $order->created_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => User::query()->count(),
                'admins' => User::query()->where('is_admin', true)->count(),
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'orders' => Order::query()->where('status', '!=', CartOrder::STATUS)->count(),
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
