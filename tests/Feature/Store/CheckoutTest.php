<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;

function checkoutCategory(array $overrides = []): Category
{
    return Category::query()->create(array_merge([
        'name' => 'processor',
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ], $overrides));
}

function checkoutProduct(Category $category, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'name' => 'Ryzen 7',
        'description' => null,
        'image' => null,
        'price_in_cents' => 25000,
        'stock' => 20,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

test('checkout returns unprocessable entity when cart is empty', function () {
    $user = createUser();

    $this->actingAs($user)
        ->post(route('checkout.store'))
        ->assertStatus(422);
});

test('checkout recalculates stale product prices and marks order as pending', function () {
    $user = createUser();
    $category = checkoutCategory();
    $product = checkoutProduct($category, [
        'price_in_cents' => 22000,
    ]);

    $order = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 999,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 100,
    ]);

    $item = $order->items()->create([
        'product_id' => (int) $product->id,
        'user_configuration_id' => null,
        'qty' => 2,
        'price' => 15000,
    ]);

    $this->actingAs($user)
        ->post(route('checkout.store'))
        ->assertRedirect(route('cart'))
        ->assertSessionHas('status', 'Checkout completed successfully.');

    $order->refresh();
    $item->refresh();

    expect((string) $order->status)->toBe('pending');
    expect((int) $order->total)->toBe(44000);
    expect((int) $order->discount_in_cents)->toBe(0);
    expect((int) $item->price)->toBe(22000);
});

test('checkout fails when cart contains non sellable product', function () {
    $user = createUser();
    $category = checkoutCategory();
    $product = checkoutProduct($category, [
        'is_sellable' => false,
    ]);

    $order = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 25000,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $order->items()->create([
        'product_id' => (int) $product->id,
        'user_configuration_id' => null,
        'qty' => 1,
        'price' => 25000,
    ]);

    $this->actingAs($user)
        ->post(route('checkout.store'))
        ->assertStatus(422);

    expect((string) $order->fresh()->status)->toBe(CartOrder::STATUS);
});

test('checkout recalculates stale user configuration prices', function () {
    $user = createUser();
    $configuration = Configuration::query()->create([
        'name' => 'Starter build',
        'description' => null,
        'image' => null,
        'price' => 100000,
        'homepage_order' => null,
    ]);

    $userConfiguration = UserConfiguration::query()->create([
        'user_id' => (int) $user->id,
        'base_configuration_id' => (int) $configuration->id,
        'name' => 'Starter build - Custom',
        'description' => null,
        'image' => null,
        'price' => 135000,
        'status' => 'cart',
        'selected_components' => null,
        'meta' => null,
    ]);

    $order = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $item = $order->items()->create([
        'product_id' => null,
        'user_configuration_id' => (int) $userConfiguration->id,
        'qty' => 1,
        'price' => 50000,
    ]);

    $this->actingAs($user)
        ->post(route('checkout.store'))
        ->assertRedirect(route('cart'))
        ->assertSessionHas('status', 'Checkout completed successfully.');

    $order->refresh();
    $item->refresh();

    expect((string) $order->status)->toBe('pending');
    expect((int) $order->total)->toBe(135000);
    expect((int) $item->price)->toBe(135000);
});
