<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['products.category:id,name'])
            ->orderBy('id')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'description' => $this->buildSpec($configuration),
                'price_in_cents' => (int) $configuration->price,
            ])
            ->values();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'configurations' => $configurations,
        ]);
    }

    private function buildSpec(Configuration $configuration): string
    {
        $cpu = $configuration->products->first(
            fn (Product $product): bool => $product->category?->name === 'processor',
        );
        $gpu = $configuration->products->first(
            fn (Product $product): bool => $product->category?->name === 'graphics-card',
        );
        $ram = $configuration->products->first(
            fn (Product $product): bool => $product->category?->name === 'memory',
        );

        $specParts = collect([
            $cpu ? 'CPU: '.$cpu->name : null,
            $gpu ? 'GPU: '.$gpu->name : null,
            $ram ? 'RAM: '.$ram->name : null,
        ])->filter()->values();

        if ($specParts->isNotEmpty()) {
            return $specParts->implode(' | ');
        }

        $fallback = $configuration->products
            ->take(3)
            ->pluck('name')
            ->filter()
            ->implode(' | ');

        return $fallback !== ''
            ? $fallback
            : ($configuration->description ?? 'Custom high-performance build.');
    }
}
