<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Services\ConfiguratorService;
use App\Support\ConfigurationSlots;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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
            ->orderByRaw('case when display_order is null then 1 else 0 end')
            ->orderBy('display_order')
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

    public function welcome(): Response
    {
        return Inertia::render('admin/configurations/welcome', [
            'configurations' => $this->welcomeConfigurations(),
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
        [$data, $productIds, $quantities] = $this->normalizeConfigurationData(
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

        DB::transaction(function () use ($data, $productIds, $quantities): void {
            $configuration = Configuration::query()->create($data);
            $configuration->products()->sync($productIds);
            $this->finalizeConfiguration($configuration, $productIds, $quantities);
        });

        return redirect()
            ->route('admin.configurations.index')
            ->with('status', 'Configuration created successfully.');
    }

    public function edit(Configuration $configuration): Response
    {
        $configuration->load(['products:id', 'slots']);

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
                'quantities' => $configuration->slots
                    ->mapWithKeys(fn (ConfigurationSlot $slot): array => [
                        (string) $slot->default_product_id => (int) $slot->quantity,
                    ])
                    ->all(),
            ],
            'components' => $this->components(),
        ]);
    }

    public function update(Request $request, Configuration $configuration): RedirectResponse
    {
        [$data, $productIds, $quantities] = $this->normalizeConfigurationData(
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

        DB::transaction(function () use ($configuration, $data, $productIds, $quantities): void {
            $configuration->update($data);
            $configuration->products()->sync($productIds);
            $this->finalizeConfiguration($configuration, $productIds, $quantities);
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

    public function updateWelcome(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'distinct', 'exists:configurations,id'],
            'items.*.homepage_order' => ['nullable', 'integer', 'min:1'],
        ]);

        $items = collect($data['items'])
            ->map(fn (array $item): array => [
                'id' => (int) $item['id'],
                'homepage_order' => $item['homepage_order'] !== null
                    ? (int) $item['homepage_order']
                    : null,
            ])
            ->values();

        $selectedItems = $items
            ->filter(fn (array $item): bool => $item['homepage_order'] !== null)
            ->values();

        if ($selectedItems->count() < 3) {
            throw ValidationException::withMessages([
                'items' => 'Choose at least 3 gaming PCs for the welcome page.',
            ]);
        }

        if ($selectedItems->pluck('homepage_order')->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Each welcome position must be unique.',
            ]);
        }

        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                Configuration::query()
                    ->whereKey($item['id'])
                    ->update([
                        'homepage_order' => $item['homepage_order'],
                    ]);
            }
        });

        return redirect()
            ->route('admin.configurations.welcome')
            ->with('status', 'Welcome page order updated successfully.');
    }

    /**
     * Persist the storefront arrangement: ids arrive in display order.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:configurations,id'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach (array_values($data['ids']) as $index => $configurationId) {
                Configuration::query()
                    ->whereKey((int) $configurationId)
                    ->update(['display_order' => $index + 1]);
            }
        });

        return back()->with('status', 'Display order updated.');
    }

    /**
     * Live compatibility verdict for the configuration form: takes the
     * currently selected component ids + quantities and returns the same
     * report shape the storefront uses.
     */
    public function check(Request $request, ConfiguratorService $configurator): JsonResponse
    {
        $data = $request->validate([
            'products' => ['nullable', 'array'],
            'products.*' => ['integer', 'exists:products,id'],
            'quantities' => ['nullable', 'array'],
            'quantities.*' => ['integer', 'min:1', 'max:10'],
        ]);

        $productIds = collect($data['products'] ?? [])
            ->map(fn ($productId): int => (int) $productId)
            ->unique()
            ->values();
        $quantities = collect($data['quantities'] ?? [])
            ->mapWithKeys(fn ($quantity, $productId): array => [(int) $productId => (int) $quantity]);

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->get()
            ->flatMap(fn (Product $product) => array_fill(
                0,
                max(1, (int) $quantities->get((int) $product->id, 1)),
                $product,
            ))
            ->values();

        $componentsTotal = (int) $products->sum(
            fn (Product $product): int => (int) $product->price_in_cents,
        );

        return response()->json([
            ...$configurator->compatibilityReport($products),
            'components_total_in_cents' => $componentsTotal,
        ]);
    }

    /**
     * Persist the derived fields that depend on the configuration's id and
     * component set: the canonical slug, the stored markup (manual price
     * minus components total), and the regenerated slots.
     *
     * @param  array<int, int>  $productIds
     * @param  array<int, int>  $quantities  product id => units per build
     */
    private function finalizeConfiguration(Configuration $configuration, array $productIds, array $quantities = []): void
    {
        $componentsTotal = $this->componentsTotal($productIds, $quantities);

        $configuration->forceFill([
            'slug' => Str::slug($configuration->name).'-'.$configuration->id,
            'markup_in_cents' => (int) $configuration->price - $componentsTotal,
        ])->save();

        ConfigurationSlots::rebuildFromProducts($configuration, $quantities);
    }

    /**
     * @param  array<int, int>  $productIds
     * @param  array<int, int>  $quantities
     */
    private function componentsTotal(array $productIds, array $quantities): int
    {
        return (int) Product::query()
            ->whereIn('id', $productIds)
            ->get(['id', 'price_in_cents'])
            ->sum(fn (Product $product): int => (int) $product->price_in_cents
                * max(1, (int) ($quantities[(int) $product->id] ?? 1)));
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
            'quantities' => ['nullable', 'array'],
            'quantities.*' => ['integer', 'min:1', 'max:10'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: array<int, int>, 2: array<int, int>}
     */
    private function normalizeConfigurationData(array $data): array
    {
        $productIds = collect($data['products'])
            ->map(fn ($productId): int => (int) $productId)
            ->unique()
            ->values()
            ->all();

        $quantities = collect($data['quantities'] ?? [])
            ->mapWithKeys(fn ($quantity, $productId): array => [(int) $productId => (int) $quantity])
            ->only($productIds)
            ->all();

        unset($data['products'], $data['quantities']);

        $manualPrice = (int) $data['price'];

        $data['price'] = $manualPrice > 0
            ? $manualPrice
            : $this->componentsTotal($productIds, $quantities);
        $data['description'] = $data['description'] !== '' ? $data['description'] : null;
        $data['remove_image'] = (bool) ($data['remove_image'] ?? false);

        return [$data, $productIds, $quantities];
    }

    /**
     * @return array<int, array{id:int, name:string, image:?string, price:int, products_count:int, homepage_order:?int}>
     */
    private function welcomeConfigurations(): array
    {
        /** @var array<int, array{id:int, name:string, image:?string, price:int, products_count:int, homepage_order:?int}> $configurations */
        $configurations = Configuration::query()
            ->withCount(['products'])
            ->orderByRaw('case when homepage_order is null then 1 else 0 end')
            ->orderBy('homepage_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'image' => $configuration->image,
                'price' => (int) $configuration->price,
                'products_count' => (int) $configuration->products_count,
                'homepage_order' => $configuration->homepage_order !== null
                    ? (int) $configuration->homepage_order
                    : null,
            ])
            ->all();

        return $configurations;
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
