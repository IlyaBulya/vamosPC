<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Models\Product;
use App\Services\ConfiguratorService;
use Inertia\Inertia;
use Inertia\Response;

class CatalogHealthController extends Controller
{
    public function index(ConfiguratorService $configurator): Response
    {
        $incompleteComponents = Product::query()
            ->with('category:id,name')
            ->where('is_component', true)
            ->where(fn ($query) => $query
                ->whereNull('component_type')
                ->orWhereNull('specs'))
            ->orderBy('category_id')
            ->orderBy('name')
            ->get(['id', 'category_id', 'component_type', 'name', 'specs'])
            ->map(fn (Product $product): array => [
                'id' => (int) $product->id,
                'name' => $product->name,
                'category_name' => $product->category?->name,
                'component_type' => $product->component_type?->value,
                'missing' => $product->component_type === null
                    ? 'component type'
                    : 'specs',
                'edit_href' => "/admin/products/{$product->id}/edit",
            ])
            ->values();

        $configurationReports = Configuration::query()
            ->with('slots.defaultProduct')
            ->orderBy('name')
            ->get()
            ->map(function (Configuration $configuration) use ($configurator): array {
                $products = $configuration->slots
                    ->flatMap(fn (ConfigurationSlot $slot) => $slot->defaultProduct !== null
                        ? array_fill(0, max(1, (int) $slot->quantity), $slot->defaultProduct)
                        : [])
                    ->values();

                $report = $configurator->compatibilityReport($products);

                return [
                    'id' => (int) $configuration->id,
                    'name' => $configuration->name,
                    'slots_count' => $configuration->slots->count(),
                    'load_watts' => $report['load_watts'],
                    'errors' => array_values(array_filter(
                        $report['violations'],
                        fn (array $violation): bool => $violation['severity'] === 'error',
                    )),
                    'warnings' => array_values(array_filter(
                        $report['violations'],
                        fn (array $violation): bool => $violation['severity'] === 'warning',
                    )),
                    'edit_href' => "/admin/configurations/{$configuration->id}/edit",
                ];
            })
            ->values();

        return Inertia::render('admin/catalog-health', [
            'incomplete_components' => $incompleteComponents,
            'configurations' => $configurationReports,
        ]);
    }
}
