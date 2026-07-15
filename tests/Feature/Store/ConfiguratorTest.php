<?php

use App\Enums\ComponentType;
use App\Models\Category;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;
use App\Support\ConfigurationSlots;
use Inertia\Testing\AssertableInertia as Assert;

function configuratorCategory(string $name): Category
{
    return Category::query()->create([
        'name' => $name,
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ]);
}

function configuratorProduct(Category $category, string $name, int $priceInCents, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'component_type' => ComponentType::fromCategoryName($category->name)?->value,
        'name' => $name,
        'description' => null,
        'image' => null,
        'price_in_cents' => $priceInCents,
        'stock' => 10,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

function configuratorAccessory(string $name = 'Logitech G435', int $priceInCents = 6011, array $overrides = []): Product
{
    $category = Category::query()->create([
        'name' => 'headset',
        'type' => 'accessory',
        'description' => null,
        'image' => null,
    ]);

    return configuratorProduct($category, $name, $priceInCents, array_merge([
        'component_type' => null,
        'is_component' => false,
    ], $overrides));
}

/**
 * Base build: GPU A (50 000) + CPU (30 000), configuration price 100 000,
 * so the stored markup is 20 000. GPU B (80 000) is a swap option and the
 * unsellable GPU must never appear as an option.
 *
 * @return array{configuration: Configuration, gpuA: Product, gpuB: Product, cpu: Product}
 */
function configuratorSetup(): array
{
    $gpuCategory = configuratorCategory('graphics-card');
    $cpuCategory = configuratorCategory('processor');

    $gpuA = configuratorProduct($gpuCategory, 'GPU A', 50000);
    $gpuB = configuratorProduct($gpuCategory, 'GPU B', 80000);
    configuratorProduct($gpuCategory, 'GPU Hidden', 10000, ['is_sellable' => false]);
    $cpu = configuratorProduct($cpuCategory, 'CPU A', 30000);

    $configuration = Configuration::query()->create([
        'name' => 'Test Build',
        'description' => null,
        'image' => null,
        'price' => 100000,
    ]);
    $configuration->products()->sync([$gpuA->id, $cpu->id]);
    $configuration->forceFill([
        'slug' => 'test-build-'.$configuration->id,
        'markup_in_cents' => 100000 - (50000 + 30000),
    ])->save();

    ConfigurationSlots::rebuildFromProducts($configuration);

    return [
        'configuration' => $configuration,
        'gpuA' => $gpuA,
        'gpuB' => $gpuB,
        'cpu' => $cpu,
    ];
}

test('configure page builds slots from configuration_slots with sellable same-type options', function () {
    ['configuration' => $configuration, 'gpuA' => $gpuA, 'gpuB' => $gpuB] = configuratorSetup();

    $this->get("/gaming-pcs/{$configuration->id}/configure")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/configure-pc')
            ->where('configuration.markup_in_cents', 20000)
            ->where('configuration.base_components_total_in_cents', 80000)
            ->has('slots', 2)
            ->where('slots.0.slot_label', 'graphics-card')
            ->where('slots.0.component_type', 'gpu')
            ->where('slots.0.default_product_id', $gpuA->id)
            ->has('slots.0.products', 2)
            ->where('slots.0.products.0.id', $gpuA->id)
            ->where('slots.0.products.1.id', $gpuB->id)
            ->where('slots.1.component_type', 'cpu'));
});

test('buying a customized build snapshots selections and prices with stored markup', function () {
    ['configuration' => $configuration, 'gpuB' => $gpuB, 'cpu' => $cpu] = configuratorSetup();
    $user = createUser();

    $slots = $configuration->slots()->get();
    $gpuSlotKey = (string) $slots->firstWhere('component_type', ComponentType::Gpu)->id;
    $cpuSlotKey = (string) $slots->firstWhere('component_type', ComponentType::Cpu)->id;

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", [
            'selected_components' => [
                $gpuSlotKey => $gpuB->id,
                $cpuSlotKey => $cpu->id,
            ],
        ])
        ->assertRedirect(route('cart'))
        ->assertSessionHasNoErrors();

    $userConfiguration = UserConfiguration::query()->firstOrFail();

    // 80 000 (GPU B) + 30 000 (CPU) + 20 000 markup
    expect((int) $userConfiguration->price)->toBe(130000)
        ->and($userConfiguration->selected_components[$gpuSlotKey]['product_id'])->toBe($gpuB->id)
        ->and($userConfiguration->meta['markup_in_cents'])->toBe(20000)
        ->and($userConfiguration->meta['selected_components_total_in_cents'])->toBe(110000);
});

test('buying rejects a product that is not an option for the slot', function () {
    ['configuration' => $configuration, 'cpu' => $cpu] = configuratorSetup();
    $user = createUser();

    $gpuSlotKey = (string) $configuration->slots()
        ->get()
        ->firstWhere('component_type', ComponentType::Gpu)
        ->id;

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", [
            'selected_components' => [
                $gpuSlotKey => $cpu->id,
            ],
        ])
        ->assertSessionHasErrors(["selected_components.{$gpuSlotKey}"]);

    expect(UserConfiguration::query()->count())->toBe(0);
});

test('software and accessories are server-priced, saved and shown in the cart', function () {
    ['configuration' => $configuration] = configuratorSetup();
    $headset = configuratorAccessory();
    $user = createUser();

    $payload = [
        'selected_components' => [],
        'selected_software' => [
            'os' => 'win11-home',
            'office' => null,
            'antivirus' => null,
        ],
        'selected_accessory_ids' => [$headset->id],
    ];

    $this->postJson("/gaming-pcs/{$configuration->id}/check", $payload)
        ->assertOk()
        ->assertJsonPath('software_total_in_cents', 14500)
        ->assertJsonPath('accessories_total_in_cents', 6011)
        ->assertJsonPath('extras_total_in_cents', 20511)
        ->assertJsonPath('final_price_in_cents', 120511);

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", $payload)
        ->assertRedirect(route('cart'))
        ->assertSessionHasNoErrors();

    $userConfiguration = UserConfiguration::query()->firstOrFail();
    $orderItem = OrderItem::query()->firstOrFail();
    $order = Order::query()->where('status', CartOrder::STATUS)->firstOrFail();

    expect((int) $userConfiguration->price)->toBe(120511)
        ->and((int) $orderItem->price)->toBe(120511)
        ->and((int) $order->total)->toBe(120511)
        ->and($userConfiguration->meta['schema_version'])->toBe(2)
        ->and($userConfiguration->meta['selected_software'][0]['option_id'])->toBe('win11-home')
        ->and($userConfiguration->meta['selected_software'][0]['price_in_cents'])->toBe(14500)
        ->and($userConfiguration->meta['selected_accessories'][0]['product_id'])->toBe($headset->id)
        ->and($userConfiguration->meta['selected_accessories'][0]['price_in_cents'])->toBe(6011)
        ->and($userConfiguration->meta['extras_total_in_cents'])->toBe(20511);

    $this->actingAs($user)
        ->get('/cart')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('items.0.item_type', 'user_configuration')
            ->where('items.0.unit_price_in_cents', 120511)
            ->where('items.0.extras.total_in_cents', 20511)
            ->where('items.0.extras.software.0.option_id', 'win11-home')
            ->where('items.0.extras.software.0.price_in_cents', 14500)
            ->where('items.0.extras.accessories.0.product_id', $headset->id)
            ->where('items.0.extras.accessories.0.price_in_cents', 6011));
});

test('buying rejects forged software and non-accessory product ids', function () {
    ['configuration' => $configuration, 'gpuA' => $gpu] = configuratorSetup();
    $user = createUser();

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", [
            'selected_software' => ['office' => 'win11-home'],
        ])
        ->assertSessionHasErrors('selected_software.office');

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", [
            'selected_accessory_ids' => [$gpu->id],
        ])
        ->assertSessionHasErrors('selected_accessory_ids.0');

    expect(UserConfiguration::query()->count())->toBe(0)
        ->and(OrderItem::query()->count())->toBe(0);
});

test('drafts preserve optional software and accessories when reopened', function () {
    ['configuration' => $configuration] = configuratorSetup();
    $headset = configuratorAccessory();
    $user = createUser();

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/drafts", [
            'selected_software' => ['antivirus' => 'eset-nod32'],
            'selected_accessory_ids' => [$headset->id],
        ])
        ->assertSessionHasNoErrors();

    $draft = UserConfiguration::query()->firstOrFail();

    expect((int) $draft->price)->toBe(109511)
        ->and($draft->meta['extras_total_in_cents'])->toBe(9511);

    $this->actingAs($user)
        ->get("/gaming-pcs/{$configuration->id}/configure?draft={$draft->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('initial_software_selections.antivirus', 'eset-nod32')
            ->where('initial_accessory_ids.0', $headset->id));
});

test('gaming pc detail page resolves by stored slug and redirects legacy ids', function () {
    ['configuration' => $configuration] = configuratorSetup();

    $this->get("/gaming-pcs/{$configuration->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('gaming-pcs/show')
            ->where('configuration.route_slug', $configuration->slug)
            ->where('configuration.components_count', 2));

    $this->get("/gaming-pcs/{$configuration->id}")
        ->assertRedirect("/gaming-pcs/{$configuration->slug}");
});
