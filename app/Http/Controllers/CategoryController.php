<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function showType(string $type): Response
    {
        $categories = Category::where('type', $type)
            ->orderBy('name')
            ->get(['name', 'description'])
            ->map(fn(Category $category): array => [
        'name' => $category->name,
        'description' => $category->description,
        ])
            ->values();

        abort_if($categories->isEmpty(), 404);

        return Inertia::render('category/type', [
            'title' => Str::headline($type),
            'type' => $type,
            'categories' => $categories,
        ]);
    }

    public function showCategory(string $type, string $category): Response
    {
        $categoryRecord = Category::where('type', $type)
            ->where('name', $category)
            ->firstOrFail(['name', 'description']);

        return Inertia::render('category/item', [
            'title' => Str::headline($categoryRecord->name),
            'type' => $type,
            'category' => [
                'name' => $categoryRecord->name,
                'description' => $categoryRecord->description,
            ],
        ]);
    }
}