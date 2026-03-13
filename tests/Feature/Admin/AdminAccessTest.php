<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\CartOrder;

function adminUser(): User
{
    $user = createUser();
    $user->forceFill(['is_admin' => true])->save();

    return $user;
}

function adminCategory(array $overrides = []): Category
{
    return Category::query()->create(array_merge([
        'name' => 'motherboard',
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ], $overrides));
}

function adminProduct(Category $category, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'name' => 'B650 Board',
        'description' => null,
        'image' => null,
        'price_in_cents' => 30000,
        'stock' => 5,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

test('non admin user cannot access admin dashboard', function () {
    adminUser();
    $user = createUser();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin user can access admin dashboard', function () {
    $this->actingAs(adminUser())
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('admin cannot delete category that still has products', function () {
    $admin = adminUser();
    $category = adminCategory();
    adminProduct($category);

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHas('error', 'This category still contains products and cannot be deleted.');

    expect($category->fresh())->not->toBeNull();
});

test('admin cannot delete product that has order items', function () {
    $admin = adminUser();
    $customer = createUser();
    $category = adminCategory();
    $product = adminProduct($category);

    $order = Order::query()->create([
        'user_id' => (int) $customer->id,
        'total' => 30000,
        'status' => CartOrder::STATUS,
        'discount_in_cents' => 0,
    ]);

    $order->items()->create([
        'product_id' => (int) $product->id,
        'user_configuration_id' => null,
        'qty' => 1,
        'price' => 30000,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.products.index'))
        ->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'))
        ->assertSessionHas('error', 'This product is already used and cannot be deleted.');

    expect($product->fresh())->not->toBeNull();
});

test('welcome configuration update requires at least three selected items', function () {
    $admin = adminUser();
    $one = Configuration::query()->create([
        'name' => 'VAMOS ONE',
        'description' => null,
        'image' => null,
        'price' => 100000,
        'homepage_order' => null,
    ]);
    $two = Configuration::query()->create([
        'name' => 'VAMOS TWO',
        'description' => null,
        'image' => null,
        'price' => 110000,
        'homepage_order' => null,
    ]);
    $three = Configuration::query()->create([
        'name' => 'VAMOS THREE',
        'description' => null,
        'image' => null,
        'price' => 120000,
        'homepage_order' => null,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.configurations.welcome'))
        ->put(route('admin.configurations.welcome.update'), [
            'items' => [
                ['id' => $one->id, 'homepage_order' => 1],
                ['id' => $two->id, 'homepage_order' => null],
                ['id' => $three->id, 'homepage_order' => null],
            ],
        ])
        ->assertRedirect(route('admin.configurations.welcome'))
        ->assertSessionHasErrors('items');
});

test('welcome configuration update rejects duplicate homepage order positions', function () {
    $admin = adminUser();
    $one = Configuration::query()->create([
        'name' => 'VAMOS ALPHA',
        'description' => null,
        'image' => null,
        'price' => 100000,
        'homepage_order' => null,
    ]);
    $two = Configuration::query()->create([
        'name' => 'VAMOS BETA',
        'description' => null,
        'image' => null,
        'price' => 110000,
        'homepage_order' => null,
    ]);
    $three = Configuration::query()->create([
        'name' => 'VAMOS GAMMA',
        'description' => null,
        'image' => null,
        'price' => 120000,
        'homepage_order' => null,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.configurations.welcome'))
        ->put(route('admin.configurations.welcome.update'), [
            'items' => [
                ['id' => $one->id, 'homepage_order' => 1],
                ['id' => $two->id, 'homepage_order' => 1],
                ['id' => $three->id, 'homepage_order' => 2],
            ],
        ])
        ->assertRedirect(route('admin.configurations.welcome'))
        ->assertSessionHasErrors('items');
});
