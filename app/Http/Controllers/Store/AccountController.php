<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\UserConfiguration;
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

        $drafts = UserConfiguration::query()
            ->where('user_id', (int) $user->id)
            ->where('status', 'draft')
            ->whereNotNull('base_configuration_id')
            ->latest()
            ->take(12)
            ->get()
            ->map(fn (UserConfiguration $draft): array => [
                'id' => (int) $draft->id,
                'name' => $draft->name,
                'price_in_cents' => (int) $draft->price,
                'has_errors' => (bool) data_get($draft->meta, 'compatibility.has_errors', false),
                'configure_href' => "/gaming-pcs/{$draft->base_configuration_id}/configure?draft={$draft->id}",
                'updated_at' => $draft->updated_at?->toDateString(),
            ])
            ->values();

        return Inertia::render('account/index', [
            'stats' => [
                'orders_count' => (int) $user->completed_orders_count,
                'security_level' => $user->two_factor_confirmed_at ? 'Advanced' : 'Basic',
            ],
            'orders' => $orders,
            'drafts' => $drafts,
        ]);
    }
}
