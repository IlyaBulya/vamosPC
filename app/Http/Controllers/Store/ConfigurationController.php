<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ConfigurationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.qty' => ['nullable', 'integer', 'min:1', 'max:99'],
            'items.*.position' => ['nullable', 'integer', 'min:0'],
        ]);

        $baseProduct = Product::query()->findOrFail((int) $data['product_id']);
        if (! $baseProduct->can_be_base_product) {
            throw ValidationException::withMessages([
                'product_id' => 'This product cannot be used as a base configuration.',
            ]);
        }

        $selectionItems = $this->selectionItems(
            $data['items'] ?? null,
            $data['product_ids'] ?? [],
        );
        [$syncPayload, $totalPrice] = $this->resolvedSelections($selectionItems, $baseProduct);

        DB::transaction(function () use ($baseProduct, $data, $syncPayload, $totalPrice, $user): void {
            $configuration = Configuration::query()->create([
                'user_id' => $user->id,
                'product_id' => $baseProduct->id,
                'name' => $data['name'] ?? "{$baseProduct->name} Configuration",
                'description' => $data['description'] ?? $baseProduct->description,
                'image' => null,
                'price' => $totalPrice,
            ]);

            if ($syncPayload !== []) {
                $configuration->products()->sync($syncPayload);
            }
        });

        return back()->with('status', 'Configuration created successfully.');
    }

    public function syncProducts(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null && $configuration->user_id === $user->id, 403);

        $data = $request->validate([
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'integer', 'exists:products,id'],
            'items.*.qty' => ['nullable', 'integer', 'min:1', 'max:99'],
            'items.*.position' => ['nullable', 'integer', 'min:0'],
        ]);

        $selectionItems = $this->selectionItems(
            $data['items'] ?? null,
            $data['product_ids'] ?? [],
        );
        [$syncPayload, $totalPrice] = $this->resolvedSelections(
            $selectionItems,
            $configuration->baseProduct,
        );

        $configuration->products()->sync($syncPayload);
        $configuration->update([
            'price' => $totalPrice,
        ]);

        return back()->with('status', 'Configuration products updated.');
    }

    /**
     * @param  mixed  $items
     * @param  mixed  $legacyProductIds
     * @return list<array{product_id:int, qty:int, position:int}>
     */
    private function selectionItems(mixed $items, mixed $legacyProductIds): array
    {
        $selectionItems = [];

        if (is_array($items) && $items !== []) {
            /** @var list<array{product_id:int, qty:int, position:int}> $selectionItems */
            $selectionItems = collect($items)
                ->map(function ($item, int $index): array {
                    $row = is_array($item) ? $item : [];

                    return [
                        'product_id' => (int) ($row['product_id'] ?? 0),
                        'qty' => max((int) ($row['qty'] ?? 1), 1),
                        'position' => max((int) ($row['position'] ?? $index), 0),
                    ];
                })
                ->filter(fn (array $item): bool => $item['product_id'] > 0)
                ->values()
                ->all();
        } elseif (is_array($legacyProductIds)) {
            /** @var list<array{product_id:int, qty:int, position:int}> $selectionItems */
            $selectionItems = collect($legacyProductIds)
                ->map(fn ($id, int $index): array => [
                    'product_id' => (int) $id,
                    'qty' => 1,
                    'position' => $index,
                ])
                ->filter(fn (array $item): bool => $item['product_id'] > 0)
                ->values()
                ->all();
        }

        /** @var list<array{product_id:int, qty:int, position:int}> $normalized */
        $normalized = collect($selectionItems)
            ->groupBy('product_id')
            ->map(function (Collection $group, int|string $productId): array {
                return [
                    'product_id' => (int) $productId,
                    'qty' => min(99, max(1, (int) $group->sum('qty'))),
                    'position' => (int) $group->min('position'),
                ];
            })
            ->sortBy('position')
            ->values()
            ->all();

        return $normalized;
    }

    /**
     * @param  list<array{product_id:int, qty:int, position:int}>  $selectionItems
     * @return array{0: array<int, array{category_id:int, qty:int, position:int}>, 1: int}
     */
    private function resolvedSelections(array $selectionItems, Product $baseProduct): array
    {
        if ($selectionItems === []) {
            return [[], (int) $baseProduct->price_in_cents];
        }

        $products = Product::query()
            ->whereIn(
                'id',
                collect($selectionItems)
                    ->pluck('product_id')
                    ->map(fn ($id): int => (int) $id)
                    ->all(),
            )
            ->where('is_available_for_configuration', true)
            ->get(['id', 'category_id', 'price_in_cents'])
            ->keyBy('id');

        if ($products->count() !== count($selectionItems)) {
            throw ValidationException::withMessages([
                'items' => 'Some selected products cannot be used in configurations.',
            ]);
        }

        /** @var array<int, array{category_id:int, qty:int, position:int}> $syncPayload */
        $syncPayload = [];
        $totalPrice = 0;

        foreach ($selectionItems as $item) {
            /** @var Product|null $product */
            $product = $products->get($item['product_id']);

            if (! $product) {
                continue;
            }

            $syncPayload[$product->id] = [
                'category_id' => (int) $product->category_id,
                'qty' => (int) $item['qty'],
                'position' => (int) $item['position'],
            ];
            $totalPrice += (int) $product->price_in_cents * (int) $item['qty'];
        }

        return [$syncPayload, $totalPrice];
    }
}
