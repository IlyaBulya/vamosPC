<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class CoolerFitRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $cooler = $build->firstOfType(ComponentType::Cooler);

        if ($cooler === null) {
            return [];
        }

        $violations = [];
        $case = $build->firstOfType(ComponentType::Case);
        $coolerType = $cooler->spec('cooler_type');

        if ($coolerType === 'air') {
            $height = $cooler->spec('height_mm');
            $maxHeight = $case?->spec('max_cooler_height_mm');

            if (is_numeric($height) && is_numeric($maxHeight) && (int) $height > (int) $maxHeight) {
                $violations[] = Violation::error(
                    'cooler_fit',
                    "The air cooler ({$height} mm) is too tall for the case (max {$maxHeight} mm).",
                    [ComponentType::Cooler->value, ComponentType::Case->value],
                );
            }
        }

        if ($coolerType === 'aio') {
            $radiator = $cooler->spec('radiator_mm');
            $supported = $case?->spec('radiator_support');

            if (is_numeric($radiator) && is_array($supported)
                && ! in_array((int) $radiator, array_map('intval', $supported), true)) {
                $violations[] = Violation::error(
                    'cooler_fit',
                    "The case has no mounting for a {$radiator} mm radiator.",
                    [ComponentType::Cooler->value, ComponentType::Case->value],
                );
            }
        }

        $rating = $cooler->spec('tdp_rating_watts');
        $cpuTdp = $build->firstOfType(ComponentType::Cpu)?->spec('tdp_watts');

        if (is_numeric($rating) && is_numeric($cpuTdp) && (int) $rating < (int) $cpuTdp) {
            $violations[] = Violation::warning(
                'cooler_fit',
                "The cooler is rated for {$rating} W but the CPU's TDP is {$cpuTdp} W; it may run hot under load.",
                [ComponentType::Cooler->value, ComponentType::Cpu->value],
            );
        }

        return $violations;
    }
}
