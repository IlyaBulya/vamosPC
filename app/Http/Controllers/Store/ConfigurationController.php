<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        ]);

        $baseProduct = Product::query()->findOrFail((int) $data['product_id']);
        if (! $baseProduct->can_be_base_product) {
            throw ValidationException::withMessages([
                'product_id' => 'This product cannot be used as a base configuration.',
            ]);
        }

        $selectedProductIds = $this->selectedProductIds($data['product_ids'] ?? []);
        $allowedProductIds = $this->allowedConfigurationProductIds($selectedProductIds);

        DB::transaction(function () use ($allowedProductIds, $baseProduct, $data, $user): void {
            $configuration = Configuration::query()->create([
                'user_id' => $user->id,
                'product_id' => $baseProduct->id,
                'name' => $data['name'] ?? "{$baseProduct->name} Configuration",
                'description' => $data['description'] ?? $baseProduct->description,
                'image' => null,
                'price' => $this->resolvedPrice($baseProduct, $allowedProductIds),
            ]);

            if ($allowedProductIds !== []) {
                $configuration->products()->sync($allowedProductIds);
            }
        });

        return back()->with('status', 'Configuration created successfully.');
    }

    public function syncProducts(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null && $configuration->user_id === $user->id, 403);

        $data = $request->validate([
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $selectedProductIds = $this->selectedProductIds($data['product_ids']);
        $allowedProductIds = $this->allowedConfigurationProductIds($selectedProductIds);

        $configuration->products()->sync($allowedProductIds);
        $configuration->update([
            'price' => $this->resolvedPrice($configuration->baseProduct, $allowedProductIds),
        ]);

        return back()->with('status', 'Configuration products updated.');
    }

    /**
     * @param  mixed  $value
     * @return list<int>
     */
    private function selectedProductIds(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        /** @var list<int> $ids */
        $ids = collect($value)
            ->map(fn ($id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->values()
            ->all();

        return $ids;
    }

    /**
     * @param  list<int>  $selectedProductIds
     * @return list<int>
     */
    private function allowedConfigurationProductIds(array $selectedProductIds): array
    {
        $allowedProductIds = Product::query()
            ->whereIn('id', $selectedProductIds)
            ->where('is_available_for_configuration', true)
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->all();

        if (count($allowedProductIds) !== count($selectedProductIds)) {
            throw ValidationException::withMessages([
                'product_ids' => 'Some selected products cannot be used in configurations.',
            ]);
        }

        return $allowedProductIds;
    }

    /**
     * @param  list<int>  $selectedProductIds
     */
    private function resolvedPrice(Product $baseProduct, array $selectedProductIds): int
    {
        if ($selectedProductIds === []) {
            return (int) $baseProduct->price_in_cents;
        }

        return (int) Product::query()
            ->whereIn('id', $selectedProductIds)
            ->sum('price_in_cents');
    }
}
