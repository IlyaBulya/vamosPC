<?php

use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityChecker;
use App\Services\Compatibility\Severity;
use Database\Seeders\DatabaseSeeder;

test('every seeded base build passes compatibility checks without errors', function () {
    $this->seed(DatabaseSeeder::class);

    $checker = CompatibilityChecker::make();

    $configurations = Configuration::query()
        ->with('slots.defaultProduct')
        ->get();

    expect($configurations)->not->toBeEmpty();

    $problems = [];

    foreach ($configurations as $configuration) {
        $products = $configuration->slots
            ->flatMap(fn (ConfigurationSlot $slot): array => $slot->defaultProduct !== null
                ? array_fill(0, max(1, (int) $slot->quantity), $slot->defaultProduct)
                : [])
            ->values();

        foreach ($checker->violations(new BuildSelection($products)) as $violation) {
            if ($violation->severity === Severity::Error) {
                $problems[] = "{$configuration->name}: {$violation->message}";
            }
        }
    }

    expect($problems)->toBe([]);
});

test('seeded components carry structured specs', function () {
    $this->seed(DatabaseSeeder::class);

    $componentsWithoutSpecs = \App\Models\Product::query()
        ->where('is_component', true)
        ->whereNotNull('component_type')
        ->whereNull('specs')
        ->pluck('name')
        ->all();

    expect($componentsWithoutSpecs)->toBe([]);
});
