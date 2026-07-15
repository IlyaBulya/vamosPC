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

test('check endpoint prices the default build from the configuration price, ignoring a stale markup', function () {
    ['configuration' => $configuration] = compatSetup();

    // Simulate drift: the stored markup was captured when components cost far
    // more, so it is now deeply negative. The old `selectedTotal + markup`
    // formula would clamp to €0.00; pricing must anchor on the config price.
    $configuration->forceFill(['markup_in_cents' => -65000])->save();

    $this->postJson("/gaming-pcs/{$configuration->id}/check", [
        'selected_components' => [],
    ])
        ->assertOk()
        ->assertJsonPath('selected_total_in_cents', 65000)
        ->assertJsonPath('final_price_in_cents', 75000);
});

test('buying the default build charges the configuration price despite a stale markup', function () {
    ['configuration' => $configuration] = compatSetup();
    $configuration->forceFill(['markup_in_cents' => -65000])->save();
    $user = createUser();

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/buy", ['selected_components' => []])
        ->assertRedirect(route('cart'));

    expect((int) UserConfiguration::query()->latest('id')->first()->price)->toBe(75000);
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

test('resolve endpoint proposes an automatic replacement for a conflicting part', function () {
    $gpuCategory = compatCategory('graphics-card');
    $psuCategory = compatCategory('power-supply');

    $smallGpu = compatComponent($gpuCategory, 'gpu', 'Small GPU', 30000, [
        'tdp_watts' => 145,
        'recommended_psu_watts' => 550,
    ]);
    $bigGpu = compatComponent($gpuCategory, 'gpu', 'Big GPU', 90000, [
        'tdp_watts' => 300,
        'recommended_psu_watts' => 750,
    ]);
    $psu650 = compatComponent($psuCategory, 'psu', '650W PSU', 5000, ['wattage' => 650]);
    $psu850 = compatComponent($psuCategory, 'psu', '850W PSU', 9000, ['wattage' => 850]);

    $configuration = Configuration::query()->create([
        'name' => 'Resolve Build',
        'description' => null,
        'image' => null,
        'price' => 40000,
    ]);
    $configuration->products()->sync([$smallGpu->id, $psu650->id]);
    ConfigurationSlots::rebuildFromProducts($configuration);

    $gpuSlotKey = compatSlotKey($configuration, 'gpu');
    $psuSlotKey = compatSlotKey($configuration, 'psu');

    // The shopper picks the big GPU while the 650W PSU is selected.
    $this->postJson("/gaming-pcs/{$configuration->id}/resolve", [
        'selected_components' => [
            $gpuSlotKey => $bigGpu->id,
            $psuSlotKey => $psu650->id,
        ],
        'changed_slot_key' => $gpuSlotKey,
    ])
        ->assertOk()
        ->assertJsonPath('resolved', true)
        ->assertJsonPath('conflicts.0.product_id', $psu650->id)
        ->assertJsonPath('replacements.0.to_product_id', $psu850->id)
        ->assertJsonPath('replacements.0.to_name', '850W PSU');
});

test('resolve endpoint reports unresolvable conflicts without replacements', function () {
    ['configuration' => $configuration, 'ddr4' => $ddr4] = compatSetup();
    $ramSlotKey = compatSlotKey($configuration, 'ram');

    // DDR4 kit against a DDR5-only board and CPU; no alternative board or
    // CPU exists, so nothing can be auto-replaced.
    $this->postJson("/gaming-pcs/{$configuration->id}/resolve", [
        'selected_components' => [$ramSlotKey => $ddr4->id],
        'changed_slot_key' => $ramSlotKey,
    ])
        ->assertOk()
        ->assertJsonPath('resolved', false)
        ->assertJsonCount(2, 'conflicts')
        ->assertJsonCount(0, 'replacements');
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

test('account page lists drafts and owners can delete them', function () {
    ['configuration' => $configuration] = compatSetup();
    $user = createUser();

    $this->actingAs($user)
        ->post("/gaming-pcs/{$configuration->id}/drafts", [
            'name' => 'Listed draft',
        ]);

    $draft = UserConfiguration::query()->firstOrFail();

    $this->actingAs($user)
        ->get('/account')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('drafts', 1)
            ->where('drafts.0.name', 'Listed draft')
            ->where('drafts.0.configure_href', "/gaming-pcs/{$configuration->id}/configure?draft={$draft->id}"));

    // A stranger cannot delete someone else's draft.
    $stranger = createUser(['email' => 'stranger2@example.com']);
    $this->actingAs($stranger)
        ->delete("/account/drafts/{$draft->id}")
        ->assertForbidden();

    $this->actingAs($user)
        ->from('/account')
        ->delete("/account/drafts/{$draft->id}")
        ->assertRedirect('/account');

    expect(UserConfiguration::query()->count())->toBe(0);
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
