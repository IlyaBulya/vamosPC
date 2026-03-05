<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function hardware(): Response
    {
        return $this->renderTypePage('hardware');
    }

    public function accessories(): Response
    {
        return $this->renderTypePage('accessory');
    }

    public function laptop(): Response
    {
        return $this->renderTypePage('laptop');
    }

    public function laptopCategory(string $category): Response
    {
        return $this->showCategory('laptop', $category);
    }

    public function showType(string $type): Response
    {
        return $this->renderTypePage($type);
    }

    public function showCategory(string $type, string $category): Response
    {
        $typeConfig = $this->typeConfig($type);

        $categoryRecord = Category::query()
            ->with([
            'products' => fn($query) => $query
        ->orderBy('name')
        ->select([
        'category_id',
        'name',
        'description',
        'price_in_cents',
        'is_component',
        ]),
        ])
            ->where('type', $type)
            ->where('name', $category)
            ->firstOrFail(['id', 'name', 'description']);

        return Inertia::render('category/item', [
            'title' => $this->headline($categoryRecord->name),
            'typeLabel' => $typeConfig['label'],
            'backHref' => $typeConfig['href'],
            'category' => [
                'name' => $categoryRecord->name,
                'description' => $categoryRecord->description,
                'product_count' => $categoryRecord->products->count(),
                'products' => $categoryRecord->products
                ->map(fn($product): array => [
        'name' => $product->name,
        'description' => $product->description,
        'price_in_cents' => $product->price_in_cents,
        'is_component' => (bool)$product->is_component,
        ])
                ->values(),
            ],
        ]);
    }

    private function renderTypePage(string $type): Response
    {
        $typeConfig = $this->typeConfig($type);

        $categories = Category::query()
            ->where('type', $type)
            ->orderBy('name')
            ->get(['name', 'description'])
            ->map(fn(Category $category): array => [
        'name' => $category->name,
        'description' => $category->description,
        ])
            ->values();

        abort_if($categories->isEmpty(), 404);

        return Inertia::render('category/type', [
            'title' => $typeConfig['label'],
            'type' => $type,
            'categories' => $categories,
        ]);
    }

    private function typeConfig(string $type): array
    {
        return match ($type) {
                'hardware' => [
                'label' => 'Hardware',
                'href' => '/catalog/hardware',
            ],
                'accessory' => [
                'label' => 'Accessories',
                'href' => '/catalog/accessories',
            ],
                'laptop' => [
                'label' => 'Laptops',
                'href' => '/laptops',
            ],
                default => abort(404),
            };
    }

    private function headline(string $value): string
    {
        return collect(explode('-', $value))
            ->map(fn(string $part): string => ucfirst($part))
            ->implode(' ');
    }
}