<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use HandlesPublicImageUploads;

    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
                'description' => $category->description,
                'image' => $category->image,
                'products_count' => (int) $category->products_count,
            ])
            ->values();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'mode' => 'create',
            'category' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'categories',
            );
        } else {
            $data['image'] = null;
        }

        Category::query()->create($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('status', 'Category created successfully.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'mode' => 'edit',
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
                'description' => $category->description,
                'image' => $category->image,
            ],
        ]);
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $this->validated($request, $category);
        $removeImage = (bool) ($data['remove_image'] ?? false);

        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->storePublicImage(
                $request->file('image'),
                'categories',
            );

            $this->deletePublicImage($category->image);
        } elseif ($removeImage) {
            $this->deletePublicImage($category->image);
            $data['image'] = null;
        } else {
            unset($data['image']);
        }

        $category->update($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('status', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->loadCount('products');

        if ($category->products_count > 0) {
            return back()->with('error', 'This category still contains products and cannot be deleted.');
        }

        $this->deletePublicImage($category->image);
        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('status', 'Category deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category?->id),
            ],
            'type' => ['required', 'string', Rule::in(['hardware', 'accessory', 'laptop'])],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'remove_image' => ['nullable', 'boolean'],
        ]);
    }
}
