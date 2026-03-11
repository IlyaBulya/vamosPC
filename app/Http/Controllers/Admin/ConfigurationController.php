<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
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
            ->values();

        return Inertia::render('admin/configurations/form', [
            'components' => $components,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
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
        $data['image'] = $data['image'] !== '' ? $data['image'] : null;

        DB::transaction(function () use ($data, $productIds): void {
            $configuration = Configuration::query()->create($data);
            $configuration->products()->sync($productIds);
        });

        return redirect()
            ->route('admin.configurations.index')
            ->with('status', 'Configuration created successfully.');
    }
}
