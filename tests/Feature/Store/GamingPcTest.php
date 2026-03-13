<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;

function gamingCategory(array $overrides = []): Category
{
    return Category::query()->create(array_merge([
        'name' => 'memory',
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ], $overrides));
}

function gamingComponent(Category $category, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'name' => 'RAM 16GB',
        'description' => null,
        'image' => null,
        'price_in_cents' => 40000,
        'stock' => 10,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

test('buying gaming configuration with default selections creates user configuration and cart item', function () {
    $user = createUser();
    $category = gamingCategory();
    $defaultComponent = gamingComponent($category, [
        'price_in_cents' => 100000,
    ]);
    gamingComponent($category, [
        'name' => 'RAM 32GB',
        'price_in_cents' => 130000,
    ]);

    $configuration = Configuration::query()->create([
        'name' => 'VAMOS START',
        'description' => 'Entry gaming PC',
        'image' => null,
        'price' => 120000,
        'homepage_order' => null,
    ]);
    $configuration->products()->attach([$defaultComponent->id]);

    $this->actingAs($user)
        ->post(route('gaming-pcs.buy', $configuration))
        ->assertRedirect(route('cart'))
        ->assertSessionHas('status', 'Custom configuration added to cart.');

    $savedConfiguration = UserConfiguration::query()->first();
    expect($savedConfiguration)->not->toBeNull();
    expect((int) $savedConfiguration->user_id)->toBe((int) $user->id);
    expect((int) $savedConfiguration->price)->toBe(120000);

    $selectionKey = 'cat-'.$category->id.'-0';
    expect($savedConfiguration->selected_components)->toHaveKey($selectionKey);
    expect((int) $savedConfiguration->selected_components[$selectionKey]['product_id'])
        ->toBe((int) $defaultComponent->id);

    $order = Order::query()->where('user_id', $user->id)->first();
    expect($order)->not->toBeNull();
    expect((int) $order->total)->toBe(120000);
    expect((string) $order->status)->toBe(CartOrder::STATUS);
});

test('buying gaming configuration with valid custom selection recalculates final price', function () {
    $user = createUser();
    $category = gamingCategory();
    $defaultComponent = gamingComponent($category, [
        'price_in_cents' => 50000,
    ]);
    $upgradeComponent = gamingComponent($category, [
        'name' => 'RAM 64GB',
        'price_in_cents' => 90000,
    ]);

    $configuration = Configuration::query()->create([
        'name' => 'VAMOS PLUS',
        'description' => null,
        'image' => null,
        'price' => 70000,
        'homepage_order' => null,
    ]);
    $configuration->products()->attach([$defaultComponent->id]);

    $slotKey = 'cat-'.$category->id.'-0';

    $this->actingAs($user)
        ->post(route('gaming-pcs.buy', $configuration), [
            'selected_components' => [
                $slotKey => $upgradeComponent->id,
            ],
        ])
        ->assertRedirect(route('cart'))
        ->assertSessionHasNoErrors();

    $savedConfiguration = UserConfiguration::query()->firstOrFail();

    expect((int) $savedConfiguration->price)->toBe(110000);
    expect((int) $savedConfiguration->selected_components[$slotKey]['product_id'])
        ->toBe((int) $upgradeComponent->id);
    expect((int) $savedConfiguration->meta['markup_in_cents'])->toBe(20000);
    expect((int) $savedConfiguration->meta['selected_components_total_in_cents'])->toBe(90000);
});

test('buying gaming configuration fails when selected component is not allowed in slot', function () {
    $user = createUser();
    $category = gamingCategory();
    $defaultComponent = gamingComponent($category);

    $otherCategory = gamingCategory([
        'name' => 'storage',
    ]);
    $disallowedComponent = gamingComponent($otherCategory, [
        'name' => 'SSD 2TB',
    ]);

    $configuration = Configuration::query()->create([
        'name' => 'VAMOS STRICT',
        'description' => null,
        'image' => null,
        'price' => 50000,
        'homepage_order' => null,
    ]);
    $configuration->products()->attach([$defaultComponent->id]);

    $slotKey = 'cat-'.$category->id.'-0';

    $this->actingAs($user)
        ->from(route('gaming-pcs.configure', $configuration))
        ->post(route('gaming-pcs.buy', $configuration), [
            'selected_components' => [
                $slotKey => $disallowedComponent->id,
            ],
        ])
        ->assertRedirect(route('gaming-pcs.configure', $configuration))
        ->assertSessionHasErrors("selected_components.{$slotKey}");

    $this->assertDatabaseCount('user_configurations', 0);
    $this->assertDatabaseCount('orderitems', 0);
});

test('buying gaming configuration fails when configuration has no components', function () {
    $user = createUser();

    $configuration = Configuration::query()->create([
        'name' => 'VAMOS EMPTY',
        'description' => null,
        'image' => null,
        'price' => 10000,
        'homepage_order' => null,
    ]);

    $this->actingAs($user)
        ->post(route('gaming-pcs.buy', $configuration))
        ->assertStatus(422);

    $this->assertDatabaseCount('user_configurations', 0);
    $this->assertDatabaseCount('orderitems', 0);
});
