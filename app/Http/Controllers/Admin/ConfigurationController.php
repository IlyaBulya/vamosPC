<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use App\Models\UserConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    use HandlesPublicImageUploads;

    public function index(): Response
    {
        $configurations = Configuration::query()
            ->withCount(['products'])
            ->with(['products:id,name'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price' => (int) $configuration->price,
                'products_count' => (int) $configuration->products_count,
                'products' => $configuration->products
                    ->take(5)
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'name' => $product->name,
                    ])
                    ->values()
                    ->all(),
                'updated_at' => $configuration->updated_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('admin/configurations/index', [
            'configurations' => $configurations,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/configurations/form', [
            'mode' => 'create',
            'configuration' => null,
            'components' => $this->components(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        [$data, $productIds] = $this->normalizeConfigurationData(
            $this->validated($request),
        );

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'configurations',
            );
        } else {
            $data['image'] = null;
        }

        DB::transaction(function () use ($data, $productIds): void {
            $configuration = Configuration::query()->create($data);
            $configuration->products()->sync($productIds);
        });

        return redirect()
            ->route('admin.configurations.index')
            ->with('status', 'Configuration created successfully.');
    }

    public function edit(Configuration $configuration): Response
    {
        $configuration->load(['products:id']);

        return Inertia::render('admin/configurations/form', [
            'mode' => 'edit',
            'configuration' => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price' => (int) $configuration->price,
                'products' => $configuration->products
                    ->pluck('id')
                    ->map(fn ($productId): int => (int) $productId)
                    ->values()
                    ->all(),
            ],
            'components' => $this->components(),
        ]);
    }

    public function update(Request $request, Configuration $configuration): RedirectResponse
    {
        [$data, $productIds] = $this->normalizeConfigurationData(
            $this->validated($request),
        );
        $removeImage = (bool) ($data['remove_image'] ?? false);
        $currentImage = $configuration->image;

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'configurations',
            );
        } elseif ($removeImage) {
            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        DB::transaction(function () use ($configuration, $data, $productIds): void {
            $configuration->update($data);
            $configuration->products()->sync($productIds);
        });

        if (array_key_exists('image', $data) && $data['image'] !== $currentImage) {
            $this->deleteConfigurationImageIfUnused($currentImage, $configuration->id);
        }

        return redirect()
            ->route('admin.configurations.index')
            ->with('status', 'Configuration updated successfully.');
    }

    public function destroy(Configuration $configuration): RedirectResponse
    {
        $image = $configuration->image;
        $configuration->delete();
        $this->deleteConfigurationImageIfUnused($image, $configuration->id);

        return redirect()
            ->route('admin.configurations.index')
            ->with('status', 'Configuration deleted successfully.');
    }

    /**
     * @return array<int, array{id:int, name:string, description:?string, price_in_cents:int, color:?string, category_name:?string, category_type:?string}>
     */
    private function components(): array
    {
        /** @var array<int, array{id:int, name:string, description:?string, price_in_cents:int, color:?string, category_name:?string, category_type:?string}> $components */
        $components = Product::query()
            ->with(['category:id,name,type'])
            ->where('is_component', true)
            ->orderBy('category_id')
            ->orderBy('name')
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'color'])
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price_in_cents' => (int) $product->price_in_cents,
                'color' => $product->color,
                'category_name' => $product->category?->name,
                'category_type' => $product->category?->type,
            ])
            ->all();

        return $components;
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'remove_image' => ['nullable', 'boolean'],
            'price' => ['required', 'integer', 'min:0'],
            'products' => ['required', 'array', 'min:1'],
            'products.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('products', 'id')->where(
                    fn ($query) => $query->where('is_component', true),
                ),
            ],
        ]);
    }

    /**
     * @param array<string, mixed> $data
     * @return array{0: array<string, mixed>, 1: array<int, int>}
     */
    private function normalizeConfigurationData(array $data): array
    {
        $productIds = collect($data['products'])
            ->map(fn ($productId): int => (int) $productId)
            ->unique()
            ->values()
            ->all();

        unset($data['products']);

        $manualPrice = (int) $data['price'];

        $data['price'] = $manualPrice > 0
            ? $manualPrice
            : (int) Product::query()
                ->whereIn('id', $productIds)
                ->sum('price_in_cents');
        $data['description'] = $data['description'] !== '' ? $data['description'] : null;
        $data['remove_image'] = (bool) ($data['remove_image'] ?? false);

        return [$data, $productIds];
    }

    private function deleteConfigurationImageIfUnused(?string $image, int $configurationId): void
    {
        if (! is_string($image) || $image === '') {
            return;
        }

        if (
            Configuration::query()
                ->whereKeyNot($configurationId)
                ->where('image', $image)
                ->exists()
            || UserConfiguration::query()->where('image', $image)->exists()
        ) {
            return;
        }

        $this->deletePublicImage($image);
    }
}
