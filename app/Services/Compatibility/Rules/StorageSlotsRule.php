<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Models\Product;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class StorageSlotsRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $motherboard = $build->firstOfType(ComponentType::Motherboard);

        if ($motherboard === null) {
            return [];
        }

        $drives = $build->ofType(ComponentType::Storage);
        $violations = [];

        $checks = [
            ['m2_nvme', 'm2_slots', 'M.2 NVMe drives selected but the motherboard has only %d M.2 slots.'],
            ['sata', 'sata_ports', 'SATA drives selected but the motherboard has only %d SATA ports.'],
        ];

        foreach ($checks as [$interface, $specKey, $messageTemplate]) {
            $count = $drives
                ->filter(fn (Product $drive): bool => $drive->spec('interface') === $interface)
                ->count();
            $available = $motherboard->spec($specKey);

            if ($count > 0 && is_numeric($available) && $count > (int) $available) {
                $violations[] = Violation::error(
                    'storage_slots',
                    "{$count} ".sprintf($messageTemplate, (int) $available),
                    [ComponentType::Storage->value, ComponentType::Motherboard->value],
                );
            }
        }

        return $violations;
    }
}
