<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class FormFactorRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $case = $build->firstOfType(ComponentType::Case);

        if ($case === null) {
            return [];
        }

        $violations = [];

        $moboFormFactor = $build->firstOfType(ComponentType::Motherboard)?->spec('form_factor');
        $supportedFormFactors = $case->spec('mobo_form_factors');

        if (is_string($moboFormFactor) && is_array($supportedFormFactors)
            && ! in_array($moboFormFactor, $supportedFormFactors, true)) {
            $violations[] = Violation::error(
                'form_factor',
                "A {$moboFormFactor} motherboard does not fit this case (".implode(', ', $supportedFormFactors).' supported).',
                [ComponentType::Motherboard->value, ComponentType::Case->value],
            );
        }

        $psuFormFactor = $build->firstOfType(ComponentType::Psu)?->spec('form_factor');
        $casePsuFormFactor = $case->spec('psu_form_factor');

        if (is_string($psuFormFactor) && is_string($casePsuFormFactor)
            && $psuFormFactor !== $casePsuFormFactor) {
            $violations[] = Violation::error(
                'form_factor',
                "The case takes {$casePsuFormFactor} power supplies, but a {$psuFormFactor} unit is selected.",
                [ComponentType::Psu->value, ComponentType::Case->value],
            );
        }

        return $violations;
    }
}
