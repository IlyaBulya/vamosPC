<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\PowerCalculator;
use App\Services\Compatibility\Violation;

class PsuWattageRule implements CompatibilityRule
{
    /**
     * Warn when less than this fraction of PSU capacity is left as headroom.
     */
    private const HEADROOM_WARNING_RATIO = 0.2;

    public function __construct(
        private readonly PowerCalculator $powerCalculator = new PowerCalculator,
    ) {}

    public function check(BuildSelection $build): array
    {
        $psuWattage = $build->firstOfType(ComponentType::Psu)?->spec('wattage');

        if (! is_numeric($psuWattage)) {
            return [];
        }

        $psuWattage = (int) $psuWattage;
        $violations = [];

        foreach ($build->ofType(ComponentType::Gpu) as $gpu) {
            $recommended = $gpu->spec('recommended_psu_watts');

            if (is_numeric($recommended) && $psuWattage < (int) $recommended) {
                $violations[] = Violation::error(
                    'psu_wattage',
                    "The graphics card requires at least a {$recommended} W power supply ({$psuWattage} W selected).",
                    [ComponentType::Psu->value, ComponentType::Gpu->value],
                );
            }
        }

        $loadWatts = $this->powerCalculator->loadWatts($build);

        if ($loadWatts === null) {
            return $violations;
        }

        if ($psuWattage < $loadWatts) {
            $violations[] = Violation::error(
                'psu_wattage',
                "Estimated load of {$loadWatts} W exceeds the {$psuWattage} W power supply.",
                [ComponentType::Psu->value],
            );
        } elseif (($psuWattage - $loadWatts) / $psuWattage < self::HEADROOM_WARNING_RATIO) {
            $violations[] = Violation::warning(
                'psu_wattage',
                'Only '.($psuWattage - $loadWatts)." W of headroom left on the power supply (estimated load {$loadWatts} W); consider a stronger unit.",
                [ComponentType::Psu->value],
            );
        }

        return $violations;
    }
}
