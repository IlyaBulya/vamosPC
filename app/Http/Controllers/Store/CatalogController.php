<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(): Response
    {
        $categoryCounts = Category::query()
            ->selectRaw('type, COUNT(*) as total')
            ->whereIn('type', ['hardware', 'accessory', 'laptop'])
            ->groupBy('type')
            ->pluck('total', 'type');

        return Inertia::render('store/catalog', [
            'types' => [
                [
                    'title' => 'Hardware',
                    'href' => '/hardware',
                    'description' => 'Core PC components and internal parts.',
                    'count' => (int)($categoryCounts['hardware'] ?? 0),
                ],
                [
                    'title' => 'Accessories',
                    'href' => '/accessories',
                    'description' => 'Peripherals and setup add-ons for your desk.',
                    'count' => (int)($categoryCounts['accessory'] ?? 0),
                ],
                [
                    'title' => 'Notebook',
                    'href' => '/notebook',
                    'description' => 'Laptop brands and notebook-focused categories.',
                    'count' => (int)($categoryCounts['laptop'] ?? 0),
                ],
            ],
        ]);
    }
}