<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['user:id,name,email', 'baseProduct:id,name'])
            ->withCount('products')
            ->latest()
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'user_name' => $configuration->user?->name ?? 'Unknown user',
                'user_email' => $configuration->user?->email ?? 'unknown@example.com',
                'base_product_name' => $configuration->baseProduct?->name,
                'price_in_cents' => (int) $configuration->price,
                'products_count' => (int) $configuration->products_count,
                'created_at' => $configuration->created_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('admin/configurations/index', [
            'configurations' => $configurations,
        ]);
    }
}
