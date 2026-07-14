<?php

use App\Enums\ComponentType;
use App\Models\Category;
use App\Models\Configuration;
use App\Models\Product;
use App\Models\UserConfiguration;
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
