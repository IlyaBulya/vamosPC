<?php

use App\Models\Order;
use App\Support\CartOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('ensure for user creates a cart order with default totals', function () {
    $user = createUser();

    $order = CartOrder::ensureForUser($user);

    expect($order->exists)->toBeTrue();
    expect((int) $order->user_id)->toBe((int) $user->id);
    expect((string) $order->status)->toBe(CartOrder::STATUS);
    expect((int) $order->total)->toBe(0);
    expect((int) $order->discount_in_cents)->toBe(0);
    expect(Order::query()->count())->toBe(1);
});

test('active for user returns latest cart order only', function () {
    $user = createUser();

    Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => 'pending',
        'discount_in_cents' => 0,
    ]);

    $firstCart = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 1000,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $latestCart = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 2000,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $active = CartOrder::activeForUser($user);

    expect($active)->not->toBeNull();
    expect((int) $active->id)->toBe((int) $latestCart->id);
    expect((int) $active->id)->not->toBe((int) $firstCart->id);
});

test('sync total recalculates from line items and persists value', function () {
    $user = createUser();

    $order = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $order->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 2,
        'price' => 1500,
    ]);
    $order->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 3,
        'price' => 700,
    ]);

    $total = CartOrder::syncTotal($order);

    expect($total)->toBe(5100);
    expect((int) $order->fresh()->total)->toBe(5100);
});

test('count for user only includes quantities in cart status orders', function () {
    $user = createUser();
    $otherUser = createUser();

    $cartOrder = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);
    $completedOrder = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => 'completed',
        'discount_in_cents' => 0,
    ]);
    $otherUserCart = Order::query()->create([
        'user_id' => (int) $otherUser->id,
        'total' => 0,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $cartOrder->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 4,
        'price' => 100,
    ]);
    $cartOrder->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 2,
        'price' => 200,
    ]);
    $completedOrder->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 7,
        'price' => 300,
    ]);
    $otherUserCart->items()->create([
        'product_id' => null,
        'user_configuration_id' => null,
        'qty' => 9,
        'price' => 400,
    ]);

    expect(CartOrder::countForUser($user))->toBe(6);
    expect(CartOrder::countForUser($otherUser))->toBe(9);
});
