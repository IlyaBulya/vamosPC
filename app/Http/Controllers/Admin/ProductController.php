<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use HandlesPublicImageUploads;

    public function index(): Response
    {
        $products = Product::query()
            ->with('category:id,name,type')
            ->withCount(['orderItems'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'image' => $product->image,
                'category_name' => $product->category?->name,
                'category_type' => $product->category?->type,
                'price_in_cents' => (int) $product->price_in_cents,
                'stock' => (int) $product->stock,
                'color' => $product->color,
                'is_component' => (bool) $product->is_component,
                'is_sellable' => (bool) $product->is_sellable,
                'order_items_count' => (int) $product->order_items_count,
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

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'products',
            );
        } else {
            $data['image'] = null;
        }

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
                'image' => $product->image,
                'price_in_cents' => (int) $product->price_in_cents,
                'stock' => (int) $product->stock,
                'color' => $product->color,
                'is_component' => (bool) $product->is_component,
                'is_sellable' => (bool) $product->is_sellable,
            ],
            'categories' => $this->categories(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request);

        $removeImage = (bool) ($data['remove_image'] ?? false);

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'products',
            );

            $this->deletePublicImage($product->image);
        } elseif ($removeImage) {
            $this->deletePublicImage($product->image);
            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        $product->update($data);

        return redirect()
            ->route('admin.products.index')
            ->with('status', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->loadCount(['orderItems']);

        if ($product->order_items_count > 0) {
            return back()->with('error', 'This product is already used and cannot be deleted.');
        }

        $this->deletePublicImage($product->image);
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
            'image' => ['nullable', 'image', 'max:4096'],
            'remove_image' => ['nullable', 'boolean'],
            'price_in_cents' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:255'],
            'is_component' => ['required', 'boolean'],
            'is_sellable' => ['required', 'boolean'],
        ]);

        $data['category_id'] = (int) $data['category_id'];
        $data['price_in_cents'] = (int) $data['price_in_cents'];
        $data['stock'] = (int) $data['stock'];
        $data['is_component'] = (bool) $data['is_component'];
        $data['is_sellable'] = (bool) $data['is_sellable'];
        $data['remove_image'] = (bool) ($data['remove_image'] ?? false);

        return $data;
    }
}
