<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class GpuFitRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $maxLength = $build->firstOfType(ComponentType::Case)?->spec('max_gpu_length_mm');

        if (! is_numeric($maxLength)) {
            return [];
        }

        $violations = [];

        foreach ($build->ofType(ComponentType::Gpu) as $gpu) {
            $length = $gpu->spec('length_mm');

            if (is_numeric($length) && (int) $length > (int) $maxLength) {
                $violations[] = Violation::error(
                    'gpu_fit',
                    "The graphics card ({$length} mm) is too long for the case (max {$maxLength} mm).",
                    [ComponentType::Gpu->value, ComponentType::Case->value],
                );
            }
        }

        return $violations;
    }
}
