<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with('category:id,name,type')
            ->withCount(['orderItems', 'configurations', 'baseConfigurations'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'category_name' => $product->category?->name,
                'category_type' => $product->category?->type,
                'price_in_cents' => (int) $product->price_in_cents,
                'stock' => (int) $product->stock,
                'color' => $product->color,
                'is_component' => (bool) $product->is_component,
                'can_be_base_product' => (bool) $product->can_be_base_product,
                'is_sellable' => (bool) $product->is_sellable,
                'is_available_for_configuration' => (bool) $product->is_available_for_configuration,
                'order_items_count' => (int) $product->order_items_count,
                'configurations_count' => (int) $product->configurations_count,
                'base_configurations_count' => (int) $product->base_configurations_count,
            ])
            ->values();

        return Inertia::render('admin/products/index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'mode' => 'create',
            'product' => null,
            'categories' => $this->categories(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Product::query()->create($data);

        return redirect()
            ->route('admin.products.index')
            ->with('status', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/form', [
            'mode' => 'edit',
            'product' => [
                'id' => $product->id,
                'category_id' => (int) $product->category_id,
                'name' => $product->name,
                'description' => $product->description,
                'price_in_cents' => (int) $product->price_in_cents,
                'stock' => (int) $product->stock,
                'color' => $product->color,
                'is_component' => (bool) $product->is_component,
                'can_be_base_product' => (bool) $product->can_be_base_product,
                'is_sellable' => (bool) $product->is_sellable,
                'is_available_for_configuration' => (bool) $product->is_available_for_configuration,
            ],
            'categories' => $this->categories(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validated($request));

        return redirect()
            ->route('admin.products.index')
            ->with('status', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->loadCount(['orderItems', 'configurations', 'baseConfigurations']);

        if ($product->order_items_count > 0 || $product->configurations_count > 0 || $product->base_configurations_count > 0) {
            return back()->with('error', 'This product is already used and cannot be deleted.');
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('status', 'Product deleted successfully.');
    }

    /**
     * @return array<int, array{id:int, name:string, type:string}>
     */
    private function categories(): array
    {
        /** @var array<int, array{id:int, name:string, type:string}> $categories */
        $categories = Category::query()
            ->orderBy('type')
            ->orderBy('name')
            ->get(['id', 'name', 'type'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
            ])
            ->all();

        return $categories;
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_in_cents' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:255'],
            'is_component' => ['required', 'boolean'],
            'can_be_base_product' => ['required', 'boolean'],
            'is_sellable' => ['required', 'boolean'],
            'is_available_for_configuration' => ['required', 'boolean'],
        ]);

        $data['category_id'] = (int) $data['category_id'];
        $data['price_in_cents'] = (int) $data['price_in_cents'];
        $data['stock'] = (int) $data['stock'];
        $data['is_component'] = (bool) $data['is_component'];
        $data['can_be_base_product'] = (bool) $data['can_be_base_product'];
        $data['is_sellable'] = (bool) $data['is_sellable'];
        $data['is_available_for_configuration'] = (bool) $data['is_available_for_configuration'];

        if ($data['is_component'] && $data['can_be_base_product']) {
            throw ValidationException::withMessages([
                'can_be_base_product' => 'Components cannot be used as base products.',
            ]);
        }

        return $data;
    }
}
