<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;

function createStoreCategory(array $overrides = []): Category
{
    return Category::query()->create(array_merge([
        'name' => 'graphics-card',
        'type' => 'hardware',
        'description' => 'Graphics cards',
        'image' => null,
    ], $overrides));
}

function createStoreProduct(Category $category, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'name' => 'RTX 5070',
        'description' => 'GPU',
        'image' => null,
        'price_in_cents' => 100000,
        'stock' => 10,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

test('authenticated user can add sellable product to cart and total is synced', function () {
    $user = createUser();
    $category = createStoreCategory();
    $product = createStoreProduct($category, [
        'price_in_cents' => 125000,
    ]);

    $this->actingAs($user)
        ->from('/catalog')
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ])
        ->assertRedirect('/catalog')
        ->assertSessionHasNoErrors();

    $order = Order::query()
        ->where('user_id', $user->id)
        ->where('status', CartOrder::STATUS)
        ->first();

    expect($order)->not->toBeNull();
    expect((int) $order->total)->toBe(250000);

    $item = OrderItem::query()->first();
    expect($item)->not->toBeNull();
    expect((int) $item->product_id)->toBe((int) $product->id);
    expect((int) $item->qty)->toBe(2);
    expect((int) $item->price)->toBe(125000);
});

test('non sellable product cannot be added to cart', function () {
    $user = createUser();
    $category = createStoreCategory();
    $product = createStoreProduct($category, [
        'is_sellable' => false,
    ]);

    $this->actingAs($user)
        ->from('/catalog')
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 1,
        ])
        ->assertRedirect('/catalog')
        ->assertSessionHasErrors('product_id');

    $this->assertDatabaseCount('orders', 1);
    $this->assertDatabaseCount('orderitems', 0);
});

test('cannot submit product and user configuration in same cart request', function () {
    $user = createUser();
    $category = createStoreCategory();
    $product = createStoreProduct($category);
    $userConfiguration = UserConfiguration::query()->create([
        'user_id' => (int) $user->id,
        'base_configuration_id' => null,
        'name' => 'Custom build',
        'description' => null,
        'image' => null,
        'price' => 150000,
        'status' => 'cart',
        'selected_components' => null,
        'meta' => null,
    ]);

    $this->actingAs($user)
        ->from('/cart')
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'user_configuration_id' => $userConfiguration->id,
            'quantity' => 1,
        ])
        ->assertRedirect('/cart')
        ->assertSessionHasErrors(['product_id', 'user_configuration_id']);

    $this->assertDatabaseCount('orderitems', 0);
});

test('adding existing product item caps quantity at ninety nine and refreshes unit price', function () {
    $user = createUser();
    $category = createStoreCategory();
    $product = createStoreProduct($category, [
        'price_in_cents' => 9900,
    ]);

    $order = Order::query()->create([
        'user_id' => (int) $user->id,
        'total' => 0,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $orderItem = $order->items()->create([
        'product_id' => (int) $product->id,
        'user_configuration_id' => null,
        'qty' => 98,
        'price' => 5000,
    ]);

    $this->actingAs($user)
        ->from('/cart')
        ->post(route('cart.items.store'), [
            'product_id' => $product->id,
            'quantity' => 5,
        ])
        ->assertRedirect('/cart')
        ->assertSessionHasNoErrors();

    $orderItem->refresh();
    $order->refresh();

    expect((int) $orderItem->qty)->toBe(99);
    expect((int) $orderItem->price)->toBe(9900);
    expect((int) $order->total)->toBe(980100);
});

test('user cannot update cart item that belongs to another user', function () {
    $owner = createUser();
    $otherUser = createUser();
    $category = createStoreCategory();
    $product = createStoreProduct($category);

    $order = Order::query()->create([
        'user_id' => (int) $owner->id,
        'total' => 100000,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $orderItem = $order->items()->create([
        'product_id' => (int) $product->id,
        'user_configuration_id' => null,
        'qty' => 1,
        'price' => 100000,
    ]);

    $this->actingAs($otherUser)
        ->patch(route('cart.items.update', $orderItem), [
            'quantity' => 3,
        ])
        ->assertNotFound();

    expect((int) $orderItem->fresh()->qty)->toBe(1);
});
