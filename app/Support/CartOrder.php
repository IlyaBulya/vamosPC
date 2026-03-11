<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

class CartOrder
{
    public const STATUS = 'cart';

    public static function activeForUser(User $user): ?Order
    {
        return Order::query()
            ->where('user_id', $user->id)
            ->where('status', self::STATUS)
            ->latest('id')
            ->first();
    }

    public static function ensureForUser(User $user): Order
    {
        return self::activeForUser($user) ?? Order::query()->create([
            'user_id' => $user->id,
            'total' => 0,
            'status' => self::STATUS,
            'discount_in_cents' => 0,
        ]);
    }

    public static function syncTotal(Order $order): int
    {
        $total = (int) $order->items()
            ->get(['qty', 'price'])
            ->sum(fn (OrderItem $item): int => (int) $item->qty * (int) $item->price);

        $order->update([
            'total' => $total,
        ]);

        return $total;
    }

    public static function countForUser(User $user): int
    {
        return (int) OrderItem::query()
            ->whereHas('order', fn ($query) => $query
                ->where('user_id', $user->id)
                ->where('status', self::STATUS))
            ->sum('qty');
    }
}

