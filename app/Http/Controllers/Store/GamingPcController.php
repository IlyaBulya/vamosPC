<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['products.category:id,name'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->products->count(),
                'components' => $configuration->products
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category_name' => $product->category?->name,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('store/gaming-pcs', [
            'configurations' => $configurations,
        ]);
    }
}

