<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->customer = createUser();
    $this->order = Order::query()->create([
        'user_id' => $this->customer->id,
        'total' => 10000,
        'status' => 'pending',
    ]);
    $this->item = $this->order->items()->create([
        'qty' => 1,
        'price' => 10000,
    ]);
});

test('admin can delete an order and its items without deleting shared records', function (string $status) {
    $admin = createUser(['is_admin' => true]);
    $category = Category::query()->create(['name' => 'processor', 'type' => 'hardware']);
    $product = Product::query()->create([
        'category_id' => $category->id,
        'name' => 'Processor',
        'price_in_cents' => 10000,
        'stock' => 5,
    ]);
    $configuration = UserConfiguration::query()->create([
        'user_id' => $this->customer->id,
        'name' => 'Custom PC',
        'price' => 50000,
        'status' => 'purchased',
    ]);
    $this->order->update(['status' => $status]);
    $this->item->update(['product_id' => $product->id]);
    $configurationItem = $this->order->items()->create([
        'user_configuration_id' => $configuration->id,
        'qty' => 1,
        'price' => 50000,
    ]);
    $otherOrder = Order::query()->create([
        'user_id' => $this->customer->id,
        'total' => 50000,
        'status' => 'pending',
    ]);
    $otherItem = $otherOrder->items()->create([
        'user_configuration_id' => $configuration->id,
        'qty' => 1,
        'price' => 50000,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.orders.destroy', $this->order))
        ->assertRedirect(route('admin.orders.index'))
        ->assertSessionHas('status', "Заказ #{$this->order->id} удалён.");

    $this->assertModelMissing($this->order);
    $this->assertModelMissing($this->item);
    $this->assertModelMissing($configurationItem);
    $this->assertModelExists($this->customer);
    $this->assertModelExists($product);
    $this->assertModelExists($configuration);
    $this->assertModelExists($otherOrder);
    $this->assertModelExists($otherItem);

    $this->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders', 1)
            ->where('orders.0.id', $otherOrder->id));
})->with(['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled']);

test('admin can delete an order with no items and see an empty list', function () {
    $this->order->items()->delete();

    $this->actingAs(createUser(['is_admin' => true]))
        ->delete(route('admin.orders.destroy', $this->order))
        ->assertRedirect(route('admin.orders.index'))
        ->assertSessionHas('status');

    $this->assertModelMissing($this->order);
    $this->get(route('admin.orders.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders', 0));
});

test('customers cannot delete orders even when they own them', function (bool $isOwner) {
    $this->actingAs($isOwner ? $this->customer : createUser())
        ->delete(route('admin.orders.destroy', $this->order))
        ->assertForbidden();

    $this->assertModelExists($this->order);
    $this->assertModelExists($this->item);
})->with([true, false]);

test('guests cannot delete orders', function () {
    $this->delete(route('admin.orders.destroy', $this->order))
        ->assertRedirect(route('login'));

    $this->assertModelExists($this->order);
    $this->assertModelExists($this->item);
});

test('deleting an already deleted order returns not found', function () {
    $url = route('admin.orders.destroy', $this->order);
    $this->actingAs(createUser(['is_admin' => true]))
        ->delete($url)
        ->assertRedirect(route('admin.orders.index'));

    $this->delete($url)->assertNotFound();
});

test('admin order deletion does not delete active carts', function () {
    $this->order->update(['status' => CartOrder::STATUS]);

    $this->actingAs(createUser(['is_admin' => true]))
        ->delete(route('admin.orders.destroy', $this->order))
        ->assertNotFound();

    $this->assertModelExists($this->order);
    $this->assertModelExists($this->item);
});

test('a database deletion failure preserves the order and its items and reports an error', function () {
    Schema::create('order_deletion_locks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained('orders')->restrictOnDelete();
    });
    DB::table('order_deletion_locks')->insert(['order_id' => $this->order->id]);

    $this->actingAs(createUser(['is_admin' => true]))
        ->delete(route('admin.orders.destroy', $this->order))
        ->assertRedirect(route('admin.orders.index'))
        ->assertSessionHas('error', "Не удалось удалить заказ #{$this->order->id}. Попробуйте ещё раз.")
        ->assertSessionMissing('status');

    $this->assertModelExists($this->order);
    $this->assertModelExists($this->item);
});
