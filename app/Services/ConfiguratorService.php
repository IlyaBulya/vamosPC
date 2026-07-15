<?php

namespace App\Services;

use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Models\Product;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityChecker;
use App\Services\Compatibility\PowerCalculator;
use App\Services\Compatibility\Severity;
use App\Services\Compatibility\Violation;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ConfiguratorService
{
    private readonly CompatibilityChecker $checker;

    private readonly PowerCalculator $powerCalculator;

    public function __construct(
        ?CompatibilityChecker $checker = null,
        ?PowerCalculator $powerCalculator = null,
    ) {
        $this->checker = $checker ?? CompatibilityChecker::make();
        $this->powerCalculator = $powerCalculator ?? new PowerCalculator;
    }

    /**
     * One entry per selectable unit (slots with quantity > 1 expand into
     * "{id}:{unit}" keys), with options kept as hydrated Product models.
     *
     * @return Collection<int, array{
     *     slot_key: string,
     *     slot_label: string,
     *     component_type: string|null,
     *     category_id: int|null,
     *     category_name: string,
     *     default_product_id: int,
     *     options: Collection<int, Product>
     * }>
     */
    public function slotEntries(Configuration $configuration): Collection
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
            'price_in_cents', 'color', 'specs', 'stock', 'is_sellable',
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

        return $slots
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

                $quantity = max(1, (int) $slot->quantity);

                return collect(range(1, $quantity))
                    ->map(fn (int $unit): array => [
                        'slot_key' => $quantity > 1 ? "{$slot->id}:{$unit}" : (string) $slot->id,
                        'slot_label' => $quantity > 1 ? "{$slot->label} #{$unit}" : $slot->label,
                        'component_type' => $slot->component_type?->value,
                        'category_id' => $default->category_id !== null ? (int) $default->category_id : null,
                        'category_name' => $default->category?->name ?? 'Uncategorized',
                        'default_product_id' => (int) $slot->default_product_id,
                        'options' => $options->values(),
                    ])
                    ->all();
            })
            ->values();
    }

    /**
     * Inertia payload for the configure page.
     *
     * @return array{slots: array<int, array<string, mixed>>, base_components_total_in_cents: int}
     */
    public function builderPayload(Configuration $configuration): array
    {
        $entries = $this->slotEntries($configuration);

        $slots = $entries
            ->map(fn (array $entry): array => [
                'slot_key' => $entry['slot_key'],
                'slot_label' => $entry['slot_label'],
                'component_type' => $entry['component_type'],
                'category_id' => $entry['category_id'],
                'category_name' => $entry['category_name'],
                'default_product_id' => $entry['default_product_id'],
                'products' => $entry['options']
                    ->map(fn (Product $product): array => [
                        'id' => (int) $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'image' => $product->image,
                        'price_in_cents' => (int) $product->price_in_cents,
                        'color' => $product->color,
                        'category_name' => $product->category?->name,
                        'component_type' => $product->component_type?->value,
                        'specs' => $product->specs,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        return [
            'slots' => $slots,
            'base_components_total_in_cents' => $this->baseComponentsTotal($configuration),
        ];
    }

    public function baseComponentsTotal(Configuration $configuration): int
    {
        $configuration->loadMissing(['slots.defaultProduct']);

        return (int) $configuration->slots->sum(
            fn (ConfigurationSlot $slot): int => $slot->defaultProduct !== null
                ? (int) $slot->defaultProduct->price_in_cents * max(1, (int) $slot->quantity)
                : 0,
        );
    }

    /**
     * Validate a selection payload against the allowed options and resolve
     * it to concrete products. Missing keys fall back to the slot default.
     *
     * @param  array<string, mixed>  $selectedPayload  slot_key => product id
     * @return array{
     *     selections: array<string, array<string, mixed>>,
     *     products: Collection<string, Product>,
     *     total_in_cents: int
     * }
     *
     * @throws ValidationException
     */
    public function resolveSelections(Configuration $configuration, array $selectedPayload): array
    {
        $entries = $this->slotEntries($configuration);

        abort_if($entries->isEmpty(), 422, 'This configuration has no components.');

        $selections = [];
        $products = collect();
        $total = 0;

        foreach ($entries as $entry) {
            $slotKey = $entry['slot_key'];
            $selectedIdRaw = $selectedPayload[$slotKey] ?? $entry['default_product_id'];
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

            /** @var Product|null $selectedProduct */
            $selectedProduct = $entry['options']->first(
                fn (Product $product): bool => (int) $product->id === (int) $selectedId,
            );

            if ($selectedProduct === null) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => 'Selected component is not allowed for this slot.',
                ]);
            }

            $total += (int) $selectedProduct->price_in_cents;
            $products->put($slotKey, $selectedProduct);

            $selections[$slotKey] = [
                'slot_label' => $entry['slot_label'],
                'component_type' => $entry['component_type'],
                'category_id' => $entry['category_id'],
                'category_name' => $entry['category_name'],
                'product_id' => (int) $selectedProduct->id,
                'product_name' => $selectedProduct->name,
                'price_in_cents' => (int) $selectedProduct->price_in_cents,
            ];
        }

        return [
            'selections' => $selections,
            'products' => $products,
            'total_in_cents' => $total,
        ];
    }

    /**
     * Reject selections that cannot currently be bought.
     *
     * @param  Collection<string, Product>  $products  slot_key => product
     *
     * @throws ValidationException
     */
    public function ensurePurchasable(Collection $products): void
    {
        $unitsByProductId = $products->countBy(fn (Product $product): int => (int) $product->id);

        foreach ($products as $slotKey => $product) {
            if (! $product->is_sellable) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => "{$product->name} is no longer available.",
                ]);
            }

            if ((int) $product->stock < (int) $unitsByProductId[(int) $product->id]) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => "{$product->name} is out of stock.",
                ]);
            }
        }
    }

    /**
     * Compatibility verdict + power estimate for a set of selected products.
     *
     * @param  Collection<string, Product>  $products
     * @return array{
     *     violations: array<int, array{severity: string, rule: string, message: string, component_types: list<string>}>,
     *     has_errors: bool,
     *     load_watts: int|null
     * }
     */
    public function compatibilityReport(Collection $products): array
    {
        $build = new BuildSelection($products->values());
        $violations = $this->checker->violations($build);

        return [
            'violations' => array_map(
                fn (Violation $violation): array => $violation->toArray(),
                $violations,
            ),
            'has_errors' => array_filter(
                $violations,
                fn (Violation $violation): bool => $violation->severity === Severity::Error,
            ) !== [],
            'load_watts' => $this->powerCalculator->loadWatts($build),
        ];
    }

    /**
     * When a just-changed slot makes the build incompatible, find the
     * conflicting slots and greedily pick the cheapest alternatives that
     * bring the error count down (ideally to zero) — the "auto-replace"
     * proposal shown to the shopper before the change is applied.
     *
     * @param  array<string, mixed>  $selectedPayload  slot_key => product id (already includes the change)
     * @return array{
     *     conflicts: array<int, array{slot_key: string, product_id: int, product_name: string}>,
     *     replacements: array<int, array{slot_key: string, from_product_id: int, from_name: string, to_product_id: int, to_name: string, to_price_in_cents: int}>,
     *     resolved: bool,
     *     messages: list<string>
     * }
     */
    public function proposeReplacements(
        Configuration $configuration,
        array $selectedPayload,
        string $changedSlotKey,
    ): array {
        $entries = $this->slotEntries($configuration)->keyBy('slot_key');
        $resolved = $this->resolveSelections($configuration, $selectedPayload);

        /** @var Collection<string, Product> $working */
        $working = $resolved['products'];

        $errorsOf = fn (): array => $this->checker->errors(new BuildSelection($working->values()));
        $initialErrors = $errorsOf();

        if ($initialErrors === []) {
            return ['conflicts' => [], 'replacements' => [], 'resolved' => true, 'messages' => []];
        }

        $changedType = $entries->get($changedSlotKey)['component_type'] ?? null;
        $messages = [];
        $conflictSlotKeys = [];

        foreach ($initialErrors as $violation) {
            if ($changedType === null || ! in_array($changedType, $violation->componentTypes, true)) {
                continue;
            }

            $messages[] = $violation->message;

            foreach ($violation->componentTypes as $type) {
                if ($type === $changedType) {
                    continue;
                }

                foreach ($entries as $slotKey => $entry) {
                    if ($entry['component_type'] === $type && $slotKey !== $changedSlotKey) {
                        $conflictSlotKeys[$slotKey] = true;
                    }
                }
            }
        }

        $conflicts = [];
        $replacements = [];
        $currentErrorCount = count($initialErrors);

        foreach (array_keys($conflictSlotKeys) as $slotKey) {
            /** @var Product $original */
            $original = $working->get($slotKey);
            $conflicts[] = [
                'slot_key' => (string) $slotKey,
                'product_id' => (int) $original->id,
                'product_name' => $original->name,
            ];

            if ($currentErrorCount === 0) {
                continue;
            }

            $best = null;
            $bestCount = $currentErrorCount;

            foreach ($entries->get($slotKey)['options'] as $candidate) {
                if ((int) $candidate->id === (int) $original->id) {
                    continue;
                }

                $working->put($slotKey, $candidate);
                $count = count($errorsOf());

                if ($count < $bestCount) {
                    $best = $candidate;
                    $bestCount = $count;

                    if ($count === 0) {
                        break;
                    }
                }
            }

            $working->put($slotKey, $best ?? $original);

            if ($best !== null) {
                $currentErrorCount = $bestCount;
                $replacements[] = [
                    'slot_key' => (string) $slotKey,
                    'from_product_id' => (int) $original->id,
                    'from_name' => $original->name,
                    'to_product_id' => (int) $best->id,
                    'to_name' => $best->name,
                    'to_price_in_cents' => (int) $best->price_in_cents,
                ];
            }
        }

        return [
            'conflicts' => $conflicts,
            'replacements' => $replacements,
            'resolved' => $currentErrorCount === 0,
            'messages' => array_values(array_unique($messages)),
        ];
    }

    /**
     * For every slot option, would swapping it into the current build
     * introduce compatibility errors involving that component? Only
     * incompatible options are listed.
     *
     * @param  Collection<string, Product>  $selectedProducts  slot_key => product
     * @return array<string, array<int, array{product_id: int, messages: list<string>}>>
     */
    public function optionAnnotations(Configuration $configuration, Collection $selectedProducts): array
    {
        $annotations = [];

        foreach ($this->slotEntries($configuration) as $entry) {
            $slotKey = $entry['slot_key'];
            $currentId = $selectedProducts->get($slotKey) !== null
                ? (int) $selectedProducts->get($slotKey)->id
                : null;

            foreach ($entry['options'] as $option) {
                $optionType = $option->component_type?->value;

                if ($optionType === null || (int) $option->id === $currentId) {
                    continue;
                }

                $hypothetical = $selectedProducts->except([$slotKey])->values()->push($option);
                $messages = [];

                foreach ($this->checker->errors(new BuildSelection($hypothetical)) as $violation) {
                    if (in_array($optionType, $violation->componentTypes, true)) {
                        $messages[] = $violation->message;
                    }
                }

                if ($messages !== []) {
                    $annotations[$slotKey][] = [
                        'product_id' => (int) $option->id,
                        'messages' => $messages,
                    ];
                }
            }
        }

        return $annotations;
    }
}
