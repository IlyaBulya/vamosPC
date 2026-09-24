<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\CartOrder;
use Illuminate\Database\QueryException;
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
            ->with(['user:id,name,email', 'items.product:id,name', 'items.userConfiguration:id,name'])
            ->latest()
            ->get()
            ->map(function (Order $order): array {
                $items = $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'name' => $item->product?->name ?? $item->userConfiguration?->name ?? 'Unknown item',
                    'kind' => $item->user_configuration_id !== null ? 'User Configuration' : 'Product',
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

    public function destroy(Order $order): RedirectResponse
    {
        abort_if($order->status === CartOrder::STATUS, 404);

        try {
            // The orderitems foreign key cascades within the same transaction.
            $order->deleteOrFail();
        } catch (QueryException $exception) {
            report($exception);

            return redirect()
                ->route('admin.orders.index')
                ->with('error', "Не удалось удалить заказ #{$order->id}. Попробуйте ещё раз.");
        }

        return redirect()
            ->route('admin.orders.index')
            ->with('status', "Заказ #{$order->id} удалён.");
    }
}
