<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\Product;
use App\Models\User;
use App\Support\ConfigurationSlots;
use Inertia\Testing\AssertableInertia as Assert;

function catalogAdmin(): User
{
    $user = createUser();
    $user->forceFill(['is_admin' => true])->save();

    return $user;
}

function catalogCategory(string $name): Category
{
    return Category::query()->create([
        'name' => $name,
        'type' => 'hardware',
        'description' => null,
        'image' => null,
    ]);
}

function catalogProduct(Category $category, array $overrides = []): Product
{
    return Product::query()->create(array_merge([
        'category_id' => (int) $category->id,
        'name' => 'Part',
        'description' => null,
        'image' => null,
        'price_in_cents' => 10000,
        'stock' => 5,
        'color' => null,
        'is_component' => true,
        'is_sellable' => true,
    ], $overrides));
}

test('admin can store a product with typed specs, filtered and cast', function () {
    $category = catalogCategory('graphics-card');

    $this->actingAs(catalogAdmin())
        ->post('/admin/products', [
            'category_id' => $category->id,
            'name' => 'RTX Test',
            'description' => 'GPU',
            'price_in_cents' => 50000,
            'stock' => 3,
            'color' => '',
            'component_type' => 'gpu',
            'specs' => [
                'length_mm' => '242',
                'tdp_watts' => '220',
                'recommended_psu_watts' => '',
                'vram_gb' => '16',
                'unknown_key' => 'dropped',
            ],
            'is_component' => true,
            'is_sellable' => true,
        ])
        ->assertRedirect(route('admin.products.index'))
        ->assertSessionHasNoErrors();

    $product = Product::query()->where('name', 'RTX Test')->firstOrFail();

    expect($product->component_type?->value)->toBe('gpu')
        ->and($product->specs)->toBe([
            'length_mm' => 242,
            'tdp_watts' => 220,
            'vram_gb' => 16,
        ]);
});

test('component type is derived from the category when not submitted', function () {
    $category = catalogCategory('processor');

    $this->actingAs(catalogAdmin())
        ->post('/admin/products', [
            'category_id' => $category->id,
            'name' => 'CPU Test',
            'description' => '',
            'price_in_cents' => 20000,
            'stock' => 3,
            'color' => '',
            'is_component' => true,
            'is_sellable' => true,
        ])
        ->assertSessionHasNoErrors();

    expect(Product::query()->where('name', 'CPU Test')->firstOrFail()->component_type?->value)
        ->toBe('cpu');
});

test('configuration store honors quantities in slots and markup', function () {
    $ramCategory = catalogCategory('memory');
    $ram = catalogProduct($ramCategory, [
        'name' => 'RAM Kit',
        'component_type' => 'ram',
        'price_in_cents' => 10000,
    ]);

    $this->actingAs(catalogAdmin())
        ->post('/admin/configurations', [
            'name' => 'Qty Build',
            'description' => '',
            'price' => 50000,
            'products' => [$ram->id],
            'quantities' => [(string) $ram->id => 2],
        ])
        ->assertRedirect(route('admin.configurations.index'))
        ->assertSessionHasNoErrors();

    $configuration = Configuration::query()->where('name', 'Qty Build')->firstOrFail();
    $slot = $configuration->slots()->firstOrFail();

    expect((int) $slot->quantity)->toBe(2)
        // markup = 50 000 − 2 × 10 000
        ->and((int) $configuration->markup_in_cents)->toBe(30000)
        ->and($configuration->slug)->toBe('qty-build-'.$configuration->id);
});

test('admin check endpoint reports violations for a broken selection', function () {
    $cpuCategory = catalogCategory('processor');
    $moboCategory = catalogCategory('motherboard');

    $cpu = catalogProduct($cpuCategory, [
        'name' => 'AM5 CPU',
        'component_type' => 'cpu',
        'specs' => ['socket' => 'AM5'],
    ]);
    $mobo = catalogProduct($moboCategory, [
        'name' => 'AM4 Board',
        'component_type' => 'motherboard',
        'specs' => ['socket' => 'AM4'],
    ]);

    $this->actingAs(catalogAdmin())
        ->postJson('/admin/configurations/check', [
            'products' => [$cpu->id, $mobo->id],
            'quantities' => [],
        ])
        ->assertOk()
        ->assertJsonPath('has_errors', true)
        ->assertJsonPath('components_total_in_cents', 20000);
});

test('catalog health page lists incomplete components and broken builds', function () {
    $gpuCategory = catalogCategory('graphics-card');
    $psuCategory = catalogCategory('power-supply');

    // Component without specs -> incomplete list.
    catalogProduct($gpuCategory, [
        'name' => 'Specless GPU',
        'component_type' => 'gpu',
    ]);

    // Build whose GPU demands more than the PSU offers -> broken list.
    $gpu = catalogProduct($gpuCategory, [
        'name' => 'Big GPU',
        'component_type' => 'gpu',
        'specs' => ['tdp_watts' => 300, 'recommended_psu_watts' => 750],
    ]);
    $psu = catalogProduct($psuCategory, [
        'name' => 'Small PSU',
        'component_type' => 'psu',
        'specs' => ['wattage' => 500],
    ]);

    $configuration = Configuration::query()->create([
        'name' => 'Broken Build',
        'description' => null,
        'image' => null,
        'price' => 100000,
    ]);
    $configuration->products()->sync([$gpu->id, $psu->id]);
    ConfigurationSlots::rebuildFromProducts($configuration);

    $this->actingAs(catalogAdmin())
        ->get('/admin/catalog-health')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/catalog-health')
            ->has('incomplete_components', 1)
            ->where('incomplete_components.0.name', 'Specless GPU')
            ->where('incomplete_components.0.missing', 'specs')
            ->has('configurations', 1)
            ->where('configurations.0.name', 'Broken Build')
            ->has('configurations.0.errors', 1));
});
