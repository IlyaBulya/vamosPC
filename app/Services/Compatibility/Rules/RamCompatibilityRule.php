<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Models\Product;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class RamCompatibilityRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $violations = [];

        $kits = $build->ofType(ComponentType::Ram);

        if ($kits->isEmpty()) {
            return [];
        }

        $motherboard = $build->firstOfType(ComponentType::Motherboard);
        $moboRamType = $motherboard?->spec('ram_type');
        $cpuRamTypes = $build->firstOfType(ComponentType::Cpu)?->spec('supported_ram_types');

        foreach ($kits as $kit) {
            $kitType = $kit->spec('ram_type');

            if (! is_string($kitType)) {
                continue;
            }

            if (is_string($moboRamType) && $kitType !== $moboRamType) {
                $violations[] = Violation::error(
                    'ram_compatibility',
                    "{$kitType} memory does not fit this motherboard ({$moboRamType} only).",
                    [ComponentType::Ram->value, ComponentType::Motherboard->value],
                );
            }

            if (is_array($cpuRamTypes) && ! in_array($kitType, $cpuRamTypes, true)) {
                $violations[] = Violation::error(
                    'ram_compatibility',
                    "The CPU does not support {$kitType} memory.",
                    [ComponentType::Ram->value, ComponentType::Cpu->value],
                );
            }
        }

        $totalModules = (int) $kits->sum(
            fn (Product $kit): int => is_numeric($kit->spec('modules')) ? (int) $kit->spec('modules') : 0,
        );
        $ramSlots = $motherboard?->spec('ram_slots');

        if ($totalModules > 0 && is_numeric($ramSlots) && $totalModules > (int) $ramSlots) {
            $violations[] = Violation::error(
                'ram_compatibility',
                "{$totalModules} memory modules selected but the motherboard has only {$ramSlots} slots.",
                [ComponentType::Ram->value, ComponentType::Motherboard->value],
            );
        }

        $totalCapacity = (int) $kits->sum(
            fn (Product $kit): int => is_numeric($kit->spec('capacity_gb')) ? (int) $kit->spec('capacity_gb') : 0,
        );
        $maxRam = $motherboard?->spec('max_ram_gb');

        if ($totalCapacity > 0 && is_numeric($maxRam) && $totalCapacity > (int) $maxRam) {
            $violations[] = Violation::error(
                'ram_compatibility',
                "{$totalCapacity} GB of memory exceeds the motherboard's {$maxRam} GB maximum.",
                [ComponentType::Ram->value, ComponentType::Motherboard->value],
            );
        }

        return $violations;
    }
}
