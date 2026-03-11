<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Configuration;
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
        $configurationCount = Configuration::query()->count();

        return Inertia::render('store/catalog', [
            'types' => [
                [
                    'title' => 'Gaming PCs',
                    'href' => '/gaming-pcs',
                    'description' => 'Prebuilt configurations ready for customization.',
                    'count' => (int) $configurationCount,
                ],
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
