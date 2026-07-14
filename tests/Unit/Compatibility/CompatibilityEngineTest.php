<?php

use App\Models\Product;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityChecker;
use App\Services\Compatibility\PowerCalculator;
use App\Services\Compatibility\Rules\CoolerFitRule;
use App\Services\Compatibility\Rules\FormFactorRule;
use App\Services\Compatibility\Rules\GpuFitRule;
use App\Services\Compatibility\Rules\PsuWattageRule;
use App\Services\Compatibility\Rules\RamCompatibilityRule;
use App\Services\Compatibility\Rules\SocketMatchRule;
use App\Services\Compatibility\Rules\StorageSlotsRule;
use App\Services\Compatibility\Severity;
use App\Services\Compatibility\Violation;
use Tests\TestCase;

uses(TestCase::class);

/**
 * In-memory product; never persisted, so no database is needed.
 */
function part(string $componentType, array $specs = []): Product
{
    return (new Product)->forceFill([
        'name' => strtoupper($componentType).' test part',
        'component_type' => $componentType,
        'specs' => $specs,
        'price_in_cents' => 10000,
    ]);
}

function build(Product ...$products): BuildSelection
{
    return new BuildSelection($products);
}

function messagesOf(array $violations): array
{
    return array_map(fn (Violation $violation): string => $violation->message, $violations);
}

// --- SocketMatchRule ---

test('socket rule flags cpu and motherboard socket mismatch', function () {
    $violations = (new SocketMatchRule)->check(build(
        part('cpu', ['socket' => 'AM5']),
        part('motherboard', ['socket' => 'AM4']),
    ));

    expect($violations)->toHaveCount(1)
        ->and($violations[0]->severity)->toBe(Severity::Error);
});

test('socket rule flags cooler without cpu socket support', function () {
    $violations = (new SocketMatchRule)->check(build(
        part('cpu', ['socket' => 'AM5']),
        part('cooler', ['sockets' => ['LGA1700', 'AM4']]),
    ));

    expect($violations)->toHaveCount(1);
});

test('socket rule stays silent on matching or missing sockets', function () {
    expect((new SocketMatchRule)->check(build(
        part('cpu', ['socket' => 'AM5']),
        part('motherboard', ['socket' => 'AM5']),
        part('cooler', ['sockets' => ['AM5']]),
    )))->toBe([]);

    // Missing specs mean "cannot verify", never an error.
    expect((new SocketMatchRule)->check(build(
        part('cpu'),
        part('motherboard'),
        part('cooler'),
    )))->toBe([]);
});

// --- RamCompatibilityRule ---

test('ram rule flags type mismatch against motherboard and cpu', function () {
    $violations = (new RamCompatibilityRule)->check(build(
        part('ram', ['ram_type' => 'DDR4', 'modules' => 2, 'capacity_gb' => 32]),
        part('motherboard', ['ram_type' => 'DDR5', 'ram_slots' => 4, 'max_ram_gb' => 192]),
        part('cpu', ['supported_ram_types' => ['DDR5']]),
    ));

    expect($violations)->toHaveCount(2)
        ->and(messagesOf($violations)[0])->toContain('DDR4');
});

test('ram rule flags too many modules and over-capacity', function () {
    $violations = (new RamCompatibilityRule)->check(build(
        part('ram', ['ram_type' => 'DDR4', 'modules' => 2, 'capacity_gb' => 64]),
        part('ram', ['ram_type' => 'DDR4', 'modules' => 2, 'capacity_gb' => 64]),
        part('motherboard', ['ram_type' => 'DDR4', 'ram_slots' => 2, 'max_ram_gb' => 64]),
    ));

    expect(messagesOf($violations))->toHaveCount(2);
});

test('ram rule accepts a valid kit', function () {
    expect((new RamCompatibilityRule)->check(build(
        part('ram', ['ram_type' => 'DDR5', 'modules' => 2, 'capacity_gb' => 32, 'speed_mt' => 6000]),
        part('motherboard', ['ram_type' => 'DDR5', 'ram_slots' => 4, 'max_ram_gb' => 192]),
        part('cpu', ['supported_ram_types' => ['DDR5']]),
    )))->toBe([]);
});

// --- PowerCalculator + PsuWattageRule ---

test('power calculator sums cpu and gpu tdp plus platform overhead', function () {
    $watts = (new PowerCalculator)->loadWatts(build(
        part('cpu', ['tdp_watts' => 120]),
        part('gpu', ['tdp_watts' => 300]),
    ));

    expect($watts)->toBe(120 + 300 + PowerCalculator::PLATFORM_OVERHEAD_WATTS);
});

test('power calculator returns null when no tdp is known', function () {
    expect((new PowerCalculator)->loadWatts(build(
        part('cpu'),
        part('gpu'),
    )))->toBeNull();
});

test('psu rule flags wattage below gpu recommendation', function () {
    $violations = (new PsuWattageRule)->check(build(
        part('gpu', ['tdp_watts' => 300, 'recommended_psu_watts' => 750]),
        part('psu', ['wattage' => 650]),
    ));

    expect($violations)->toHaveCount(1)
        ->and($violations[0]->severity)->toBe(Severity::Error)
        ->and($violations[0]->message)->toContain('750');
});

test('psu rule flags load above capacity and warns on thin headroom', function () {
    // 500 + 120 + 75 = 695 W load on a 650 W unit -> error.
    $overloaded = (new PsuWattageRule)->check(build(
        part('cpu', ['tdp_watts' => 120]),
        part('gpu', ['tdp_watts' => 500]),
        part('psu', ['wattage' => 650]),
    ));
    expect($overloaded)->toHaveCount(1)
        ->and($overloaded[0]->severity)->toBe(Severity::Error);

    // 250 + 120 + 75 = 445 W on a 500 W unit -> 11% headroom -> warning.
    $tight = (new PsuWattageRule)->check(build(
        part('cpu', ['tdp_watts' => 120]),
        part('gpu', ['tdp_watts' => 250]),
        part('psu', ['wattage' => 500]),
    ));
    expect($tight)->toHaveCount(1)
        ->and($tight[0]->severity)->toBe(Severity::Warning);
});

test('psu rule accepts a comfortable unit', function () {
    expect((new PsuWattageRule)->check(build(
        part('cpu', ['tdp_watts' => 65]),
        part('gpu', ['tdp_watts' => 145, 'recommended_psu_watts' => 550]),
        part('psu', ['wattage' => 650]),
    )))->toBe([]);
});

// --- GpuFitRule ---

test('gpu fit rule flags a card longer than the case allows', function () {
    $violations = (new GpuFitRule)->check(build(
        part('gpu', ['length_mm' => 340]),
        part('case', ['max_gpu_length_mm' => 320]),
    ));

    expect($violations)->toHaveCount(1);

    expect((new GpuFitRule)->check(build(
        part('gpu', ['length_mm' => 300]),
        part('case', ['max_gpu_length_mm' => 320]),
    )))->toBe([]);
});

// --- CoolerFitRule ---

test('cooler fit rule checks air height and aio radiator against the case', function () {
    $tallAir = (new CoolerFitRule)->check(build(
        part('cooler', ['cooler_type' => 'air', 'height_mm' => 170]),
        part('case', ['max_cooler_height_mm' => 160]),
    ));
    expect($tallAir)->toHaveCount(1);

    $unsupportedRadiator = (new CoolerFitRule)->check(build(
        part('cooler', ['cooler_type' => 'aio', 'radiator_mm' => 360]),
        part('case', ['radiator_support' => [120, 240]]),
    ));
    expect($unsupportedRadiator)->toHaveCount(1);

    expect((new CoolerFitRule)->check(build(
        part('cooler', ['cooler_type' => 'aio', 'radiator_mm' => 240]),
        part('case', ['radiator_support' => [120, 240]]),
    )))->toBe([]);
});

test('cooler fit rule warns when tdp rating is below cpu tdp', function () {
    $violations = (new CoolerFitRule)->check(build(
        part('cooler', ['cooler_type' => 'air', 'tdp_rating_watts' => 95]),
        part('cpu', ['tdp_watts' => 120]),
    ));

    expect($violations)->toHaveCount(1)
        ->and($violations[0]->severity)->toBe(Severity::Warning);
});

// --- FormFactorRule ---

test('form factor rule checks motherboard and psu against the case', function () {
    $violations = (new FormFactorRule)->check(build(
        part('motherboard', ['form_factor' => 'ATX']),
        part('psu', ['form_factor' => 'ATX']),
        part('case', ['mobo_form_factors' => ['mATX', 'ITX'], 'psu_form_factor' => 'SFX']),
    ));

    expect($violations)->toHaveCount(2);

    expect((new FormFactorRule)->check(build(
        part('motherboard', ['form_factor' => 'mATX']),
        part('psu', ['form_factor' => 'SFX']),
        part('case', ['mobo_form_factors' => ['mATX', 'ITX'], 'psu_form_factor' => 'SFX']),
    )))->toBe([]);
});

// --- StorageSlotsRule ---

test('storage rule flags more drives than the motherboard can take', function () {
    $violations = (new StorageSlotsRule)->check(build(
        part('storage', ['interface' => 'm2_nvme']),
        part('storage', ['interface' => 'm2_nvme']),
        part('storage', ['interface' => 'sata']),
        part('motherboard', ['m2_slots' => 1, 'sata_ports' => 4]),
    ));

    expect($violations)->toHaveCount(1)
        ->and($violations[0]->message)->toContain('M.2');
});

// --- CompatibilityChecker ---

test('checker aggregates violations across rules with errors first', function () {
    $checker = CompatibilityChecker::make();

    $violations = $checker->violations(build(
        part('cpu', ['socket' => 'AM5', 'tdp_watts' => 120, 'supported_ram_types' => ['DDR5']]),
        part('motherboard', ['socket' => 'AM4', 'ram_type' => 'DDR4', 'form_factor' => 'ATX']),
        part('ram', ['ram_type' => 'DDR5', 'modules' => 2, 'capacity_gb' => 32]),
        part('cooler', ['cooler_type' => 'air', 'tdp_rating_watts' => 95]),
    ));

    // socket mismatch (error) + ram/mobo mismatch (error) + cooler rating (warning)
    expect($checker->hasErrors(build(part('cpu', ['socket' => 'AM5']), part('motherboard', ['socket' => 'AM4']))))->toBeTrue();
    expect(count($violations))->toBe(3);
    expect($violations[0]->severity)->toBe(Severity::Error);
    expect(end($violations)->severity)->toBe(Severity::Warning);
});

test('checker reports nothing for a build with no specs at all', function () {
    $checker = CompatibilityChecker::make();

    expect($checker->violations(build(
        part('cpu'),
        part('gpu'),
        part('motherboard'),
        part('ram'),
        part('psu'),
        part('case'),
        part('cooler'),
        part('storage'),
    )))->toBe([]);
});
