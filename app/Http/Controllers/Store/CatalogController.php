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
                    'href' => '/catalog/hardware',
                    'description' => 'Core PC components and internal parts.',
                    'count' => (int)($categoryCounts['hardware'] ?? 0),
                ],
                [
                    'title' => 'Accessories',
                    'href' => '/catalog/accessories',
                    'description' => 'Peripherals and setup add-ons for your desk.',
                    'count' => (int)($categoryCounts['accessory'] ?? 0),
                ],
                [
                    'title' => 'Laptops',
                    'href' => '/laptops',
                    'description' => 'Brands and categories of Laptops.',
                    'count' => (int)($categoryCounts['laptop'] ?? 0),
                ],
            ],
        ]);
    }
}