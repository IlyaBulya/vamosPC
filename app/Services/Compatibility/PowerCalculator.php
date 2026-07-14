<?php

namespace App\Services\Compatibility;

use App\Enums\ComponentType;

final class PowerCalculator
{
    /**
     * Flat allowance for everything without its own TDP spec:
     * motherboard, RAM, drives, fans, pumps.
     */
    public const PLATFORM_OVERHEAD_WATTS = 75;

    /**
     * Estimated system load under stress, or null when neither the CPU
     * nor any GPU has a known TDP (no basis for an estimate).
     */
    public function loadWatts(BuildSelection $build): ?int
    {
        $known = false;
        $total = 0;

        foreach ([ComponentType::Cpu, ComponentType::Gpu] as $type) {
            foreach ($build->ofType($type) as $product) {
                $tdp = $product->spec('tdp_watts');

                if (is_numeric($tdp)) {
                    $total += (int) $tdp;
                    $known = true;
                }
            }
        }

        return $known ? $total + self::PLATFORM_OVERHEAD_WATTS : null;
    }
}
