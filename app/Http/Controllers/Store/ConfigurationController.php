<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        abort_if($baseProduct->is_component, 422, 'Components cannot be used as a base product.');

        $selectedProductIds = $this->selectedProductIds($data['product_ids'] ?? []);

        DB::transaction(function () use ($baseProduct, $data, $selectedProductIds, $user): void {
            $configuration = Configuration::query()->create([
                'user_id' => $user->id,
                'product_id' => $baseProduct->id,
                'name' => $data['name'] ?? "{$baseProduct->name} Configuration",
                'description' => $data['description'] ?? $baseProduct->description,
                'image' => null,
                'price' => $this->resolvedPrice($baseProduct, $selectedProductIds),
            ]);

            if ($selectedProductIds !== []) {
                $configuration->products()->sync($selectedProductIds);
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

        $configuration->products()->sync($selectedProductIds);
        $configuration->update([
            'price' => $this->resolvedPrice($configuration->baseProduct, $selectedProductIds),
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
