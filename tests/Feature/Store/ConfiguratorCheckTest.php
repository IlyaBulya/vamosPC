<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\ConfigurationSlots;
use Inertia\Testing\AssertableInertia as Assert;

function compatCategory(string $name): Category
{
    return Category::query()->create([
        'name' => $name,
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ]);
}

function compatComponent(Category $category, string $componentType, string $name, int $priceInCents, array $specs, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'component_type' => $componentType,
        'name' => $name,
        'description' => null,
        'image' => null,
        'price_in_cents' => $priceInCents,
        'stock' => 10,
        'color' => null,
        'specs' => $specs,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

/**
 * AM5/DDR5 base build with a DDR4 kit lurking as a swap option.
 *
 * @return array{configuration: Configuration, ddr5: Product, ddr4: Product, cpu: Product, mobo: Product}
 */
function compatSetup(): array
{
    $cpuCategory = compatCategory('processor');
    $moboCategory = compatCategory('motherboard');
    $ramCategory = compatCategory('memory');

    $cpu = compatComponent($cpuCategory, 'cpu', 'Ryzen Test', 30000, [
        'socket' => 'AM5',
        'tdp_watts' => 65,
        'supported_ram_types' => ['DDR5'],
    ]);
    $mobo = compatComponent($moboCategory, 'motherboard', 'B650 Test', 20000, [
        'socket' => 'AM5',
        'ram_type' => 'DDR5',
        'ram_slots' => 4,
        'max_ram_gb' => 192,
    ]);
    $ddr5 = compatComponent($ramCategory, 'ram', 'DDR5 Kit', 15000, [
        'ram_type' => 'DDR5',
        'modules' => 2,
        'capacity_gb' => 32,
    ]);
    $ddr4 = compatComponent($ramCategory, 'ram', 'DDR4 Kit', 8000, [
        'ram_type' => 'DDR4',
        'modules' => 2,
        'capacity_gb' => 32,
    ]);

    $configuration = Configuration::query()->create([
        'name' => 'Compat Build',
        'description' => null,
        'image' => null,
        'price' => 75000,
    ]);
    $configuration->products()->sync([$cpu->id, $mobo->id, $ddr5->id]);
    $configuration->forceFill([
        'slug' => 'compat-build-'.$configuration->id,
        'markup_in_cents' => 75000 - (30000 + 20000 + 15000),
    ])->save();

    ConfigurationSlots::rebuildFromProducts($configuration);

    return [
        'configuration' => $configuration,
        'cpu' => $cpu,
        'mobo' => $mobo,
        'ddr5' => $ddr5,
        'ddr4' => $ddr4,
    ];
}

function compatSlotKey(Configuration $configuration, string $componentType): string
{
    return (string) $configuration->slots()
        ->where('component_type', $componentType)
        ->firstOrFail()
        ->id;
}

test('check endpoint reports a clean default build with price and wattage', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $response = $this->postJson("/gaming-pcs/{$configuration->id}/check", [
        'selected_components' => [],
    ]);

    $response->assertOk()
        ->assertJson([
            'has_errors' => false,
            'violations' => [],
            'load_watts' => 65 + 75,
            'selected_total_in_cents' => 65000,
            'final_price_in_cents' => 75000,
        ]);

    // The DDR4 kit must be annotated as incompatible with the DDR5 board.
    $annotations = $response->json("option_annotations.{$ramSlotKey}");
    expect($annotations)->toHaveCount(1)
        ->and($annotations[0]['product_id'])->toBe($ddr4->id)
        ->and($annotations[0]['messages'][0])->toContain('DDR4');
});

test('check endpoint flags an incompatible selection', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $this->postJson("/gaming-pcs/{$configuration->id}/check", [
        'selected_components' => [$ramSlotKey => $ddr4->id],
    ])
        ->assertOk()
        ->assertJsonPath('has_errors', true)
        ->assertJsonPath('selected_total_in_cents', 58000);
});

test('buying an incompatible build is rejected with compatibility errors', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $user = createUser();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", [
            'selected_components' => [$ramSlotKey => $ddr4->id],
        ])
        ->assertSessionHasErrors('compatibility');

    expect(UserConfiguration::query()->count())->toBe(0)
        ->and(OrderItem::query()->count())->toBe(0);
});

test('buying an out-of-stock or unsellable component is rejected', function () {
    ['configuration' => $configuration, 'ddr5' => $ddr5] = compatSetup();
    $user = createUser();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $ddr5->update(['stock' => 0]);

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy")
        ->assertSessionHasErrors("selected_components.{$ramSlotKey}");

    expect(UserConfiguration::query()->count())->toBe(0);
});

test('a compatible purchase stores the compatibility report in meta', function () {
    ['configuration' => $configuration] = compatSetup();
    $user = createUser();

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy")
        ->assertRedirect(route('cart'))
        ->assertSessionHasNoErrors();

    $userConfiguration = UserConfiguration::query()->firstOrFail();

    expect($userConfiguration->meta['compatibility']['has_errors'])->toBeFalse()
        ->and($userConfiguration->meta['compatibility']['load_watts'])->toBe(140);
});

test('drafts can be saved even with compatibility errors and prefill the configurator', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $user = createUser();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $this->actingAs($user)
        ->from("/gaming-pcs/{$configuration->id}/configure")
        ->post("/gaming-pcs/{$configuration->id}/drafts", [
            'selected_components' => [$ramSlotKey => $ddr4->id],
            'name' => 'My experimental build',
        ])
        ->assertRedirect("/gaming-pcs/{$configuration->id}/configure")
        ->assertSessionHasNoErrors();

    $draft = UserConfiguration::query()->firstOrFail();

    expect($draft->status)->toBe('draft')
        ->and($draft->name)->toBe('My experimental build')
        ->and($draft->meta['compatibility']['has_errors'])->toBeTrue()
        ->and(OrderItem::query()->count())->toBe(0);

    $this->actingAs($user)
        ->get("/gaming-pcs/{$configuration->id}/configure?draft={$draft->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/configure-pc')
            ->where("initial_selections.{$ramSlotKey}", $ddr4->id));
});

test('drafts belonging to another user are ignored on prefill', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $owner = createUser();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    $this->actingAs($owner)
        ->post("/gaming-pcs/{$configuration->id}/drafts", [
            'selected_components' => [$ramSlotKey => $ddr4->id],
        ]);

    $draft = UserConfiguration::query()->firstOrFail();
    $stranger = createUser(['email' => 'stranger@example.com']);

    $this->actingAs($stranger)
        ->get("/gaming-pcs/{$configuration->id}/configure?draft={$draft->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('initial_selections', null));
});
