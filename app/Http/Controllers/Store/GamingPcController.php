<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    use HandlesPublicImageUploads;

    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['slots.defaultProduct.category:id,name'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'route_slug' => $this->configurationRouteSlug($configuration),
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->slots->count(),
                'components' => $configuration->slots
                    ->map(fn (ConfigurationSlot $slot): ?array => $slot->defaultProduct !== null
                        ? [
                            'id' => (int) $slot->defaultProduct->id,
                            'name' => $slot->defaultProduct->name,
                            'category_name' => $slot->defaultProduct->category?->name,
                        ]
                        : null)
                    ->filter()
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('store/gaming-pcs', [
            'configurations' => $configurations,
        ]);
    }

    public function show(string $configurationSlug): Response|RedirectResponse
    {
        if (ctype_digit($configurationSlug)) {
            $legacyConfiguration = Configuration::query()->find((int) $configurationSlug);
            abort_if($legacyConfiguration === null, 404);

            return redirect("/gaming-pcs/{$this->configurationRouteSlug($legacyConfiguration)}");
        }

        $configuration = Configuration::query()
            ->with(['slots.defaultProduct.category:id,name'])
            ->where('slug', $configurationSlug)
            ->first();

        if ($configuration === null) {
            // Legacy links: name-only slugs or stale name-id slugs.
            $legacyConfiguration = Configuration::query()
                ->get()
                ->first(
                    fn (Configuration $item): bool => $this->legacyConfigurationRouteSlug($item) === $configurationSlug
                        || Str::slug($item->name).'-'.$item->id === $configurationSlug
                );
            abort_if($legacyConfiguration === null, 404);

            return redirect("/gaming-pcs/{$this->configurationRouteSlug($legacyConfiguration)}");
        }

        return Inertia::render('gaming-pcs/show', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'route_slug' => $this->configurationRouteSlug($configuration),
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->slots->count(),
                'components' => $configuration->slots
                    ->map(fn (ConfigurationSlot $slot): ?array => $slot->defaultProduct !== null
                        ? [
                            'id' => (int) $slot->defaultProduct->id,
                            'name' => $slot->defaultProduct->name,
                            'description' => $slot->defaultProduct->description,
                            'category_name' => $slot->defaultProduct->category?->name,
                            'price_in_cents' => (int) $slot->defaultProduct->price_in_cents,
                        ]
                        : null)
                    ->filter()
                    ->values()
                    ->all(),
            ],
            'navigation' => [
                'back_to_list_href' => '/gaming-pcs',
                'configure_href' => "/gaming-pcs/{$configuration->id}/configure",
            ],
        ]);
    }

    public function configure(Configuration $configuration): Response
    {
        $builderData = $this->buildBuilderData($configuration);

        return Inertia::render('store/configure-pc', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'base_components_total_in_cents' => (int) $builderData['base_components_total_in_cents'],
                'markup_in_cents' => (int) $configuration->markup_in_cents,
            ],
            'slots' => $builderData['slots'],
        ]);
    }

    public function buy(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $builderData = $this->buildBuilderData($configuration);
        $slots = $builderData['slots'];
        $baseComponentsTotal = (int) $builderData['base_components_total_in_cents'];

        abort_if($slots->isEmpty(), 422, 'This configuration has no components.');

        $data = $request->validate([
            'selected_components' => ['nullable', 'array'],
        ]);

        $selectedPayload = is_array($data['selected_components'] ?? null)
            ? $data['selected_components']
            : [];

        $selectedComponentsTotal = 0;
        $normalizedSelections = [];

        foreach ($slots as $slot) {
            $slotKey = (string) $slot['slot_key'];
            $selectedIdRaw = $selectedPayload[$slotKey] ?? $slot['default_product_id'];
            $selectedId = filter_var(
                $selectedIdRaw,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]],
            );

            if ($selectedId === false) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => 'Invalid component selection.',
                ]);
            }

            $selectedProduct = collect($slot['products'])->first(
                fn (array $product): bool => (int) $product['id'] === (int) $selectedId,
            );

            if ($selectedProduct === null) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => 'Selected component is not allowed for this slot.',
                ]);
            }

            $selectedPrice = (int) $selectedProduct['price_in_cents'];
            $selectedComponentsTotal += $selectedPrice;

            $normalizedSelections[$slotKey] = [
                'slot_label' => (string) $slot['slot_label'],
                'component_type' => $slot['component_type'],
                'category_id' => $slot['category_id'] !== null ? (int) $slot['category_id'] : null,
                'category_name' => (string) $slot['category_name'],
                'product_id' => (int) $selectedProduct['id'],
                'product_name' => (string) $selectedProduct['name'],
                'price_in_cents' => $selectedPrice,
            ];
        }

        $markupInCents = (int) $configuration->markup_in_cents;
        $finalPrice = max(0, $selectedComponentsTotal + $markupInCents);

        DB::transaction(function () use (
            $user,
            $configuration,
            $finalPrice,
            $normalizedSelections,
            $selectedComponentsTotal,
            $baseComponentsTotal,
            $markupInCents,
        ): void {
            $userConfiguration = UserConfiguration::query()->create([
                'user_id' => (int) $user->id,
                'base_configuration_id' => (int) $configuration->id,
                'name' => "{$configuration->name} - Custom",
                'description' => $configuration->description,
                'image' => $this->copyPublicImage(
                    $configuration->image,
                    'user-configurations',
                ),
                'price' => $finalPrice,
                'status' => 'cart',
                'selected_components' => $normalizedSelections,
                'meta' => [
                    'selected_components_total_in_cents' => $selectedComponentsTotal,
                    'base_components_total_in_cents' => $baseComponentsTotal,
                    'markup_in_cents' => $markupInCents,
                ],
            ]);

            $order = CartOrder::ensureForUser($user);
            $order->items()->create([
                'product_id' => null,
                'user_configuration_id' => (int) $userConfiguration->id,
                'qty' => 1,
                'price' => $finalPrice,
            ]);

            CartOrder::syncTotal($order);
        });

        return redirect()
            ->route('cart')
            ->with('status', 'Custom configuration added to cart.');
    }

    private function configurationRouteSlug(Configuration $configuration): string
    {
        return $configuration->slug ?? Str::slug($configuration->name).'-'.$configuration->id;
    }

    private function legacyConfigurationRouteSlug(Configuration $configuration): string
    {
        return Str::slug($configuration->name);
    }

    /**
     * Build the configurator payload from the configuration's slots.
     *
     * Each slot unit becomes one selectable entry (slots with quantity > 1
     * expand into "{id}:{unit}" keys). Options are all sellable components
     * of the slot's component type; untyped slots fall back to the default
     * product's category.
     *
     * @return array{
     *     slots: Collection<int, array{
     *         slot_key: string,
     *         slot_label: string,
     *         component_type: string|null,
     *         category_id: int|null,
     *         category_name: string,
     *         default_product_id: int,
     *         products: array<int, array<string, mixed>>
     *     }>,
     *     base_components_total_in_cents: int
     * }
     */
    private function buildBuilderData(Configuration $configuration): array
    {
        $configuration->load(['slots.defaultProduct.category:id,name']);

        $slots = $configuration->slots->filter(
            fn (ConfigurationSlot $slot): bool => $slot->defaultProduct !== null,
        )->values();

        $componentTypes = $slots
            ->map(fn (ConfigurationSlot $slot): ?string => $slot->component_type?->value)
            ->filter()
            ->unique()
            ->values();

        $fallbackCategoryIds = $slots
            ->filter(fn (ConfigurationSlot $slot): bool => $slot->component_type === null)
            ->map(fn (ConfigurationSlot $slot): ?int => $slot->defaultProduct?->category_id)
            ->filter()
            ->unique()
            ->values();

        $optionColumns = [
            'id', 'category_id', 'component_type', 'name', 'description',
            'price_in_cents', 'color', 'specs',
        ];

        $optionsByType = $componentTypes->isEmpty()
            ? collect()
            : Product::query()
                ->with(['category:id,name'])
                ->where('is_component', true)
                ->where('is_sellable', true)
                ->whereIn('component_type', $componentTypes)
                ->orderBy('price_in_cents')
                ->orderBy('name')
                ->get($optionColumns)
                ->groupBy(fn (Product $product): string => (string) $product->component_type?->value);

        $optionsByCategory = $fallbackCategoryIds->isEmpty()
            ? collect()
            : Product::query()
                ->with(['category:id,name'])
                ->where('is_component', true)
                ->where('is_sellable', true)
                ->whereNull('component_type')
                ->whereIn('category_id', $fallbackCategoryIds)
                ->orderBy('price_in_cents')
                ->orderBy('name')
                ->get($optionColumns)
                ->groupBy('category_id');

        $entries = $slots
            ->flatMap(function (ConfigurationSlot $slot) use ($optionsByType, $optionsByCategory): array {
                /** @var Product $default */
                $default = $slot->defaultProduct;

                /** @var Collection<int, Product> $options */
                $options = $slot->component_type !== null
                    ? ($optionsByType->get($slot->component_type->value) ?? collect())
                    : ($optionsByCategory->get((int) $default->category_id) ?? collect());

                if (! $options->contains(fn (Product $product): bool => (int) $product->id === (int) $default->id)) {
                    $options = $options->concat([$default]);
                }

                $products = $options
                    ->map(fn (Product $product): array => [
                        'id' => (int) $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price_in_cents' => (int) $product->price_in_cents,
                        'color' => $product->color,
                        'category_name' => $product->category?->name,
                        'component_type' => $product->component_type?->value,
                        'specs' => $product->specs,
                    ])
                    ->values()
                    ->all();

                $quantity = max(1, (int) $slot->quantity);

                return collect(range(1, $quantity))
                    ->map(fn (int $unit): array => [
                        'slot_key' => $quantity > 1 ? "{$slot->id}:{$unit}" : (string) $slot->id,
                        'slot_label' => $quantity > 1 ? "{$slot->label} #{$unit}" : $slot->label,
                        'component_type' => $slot->component_type?->value,
                        'category_id' => $default->category_id !== null ? (int) $default->category_id : null,
                        'category_name' => $default->category?->name ?? 'Uncategorized',
                        'default_product_id' => (int) $slot->default_product_id,
                        'products' => $products,
                    ])
                    ->all();
            })
            ->values();

        $baseComponentsTotal = (int) $slots->sum(
            fn (ConfigurationSlot $slot): int => (int) $slot->defaultProduct->price_in_cents
                * max(1, (int) $slot->quantity),
        );

        return [
            'slots' => $entries,
            'base_components_total_in_cents' => $baseComponentsTotal,
        ];
    }
}
