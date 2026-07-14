<?php

namespace App\Services\Compatibility;

use App\Services\Compatibility\Rules\CoolerFitRule;
use App\Services\Compatibility\Rules\FormFactorRule;
use App\Services\Compatibility\Rules\GpuFitRule;
use App\Services\Compatibility\Rules\PsuWattageRule;
use App\Services\Compatibility\Rules\RamCompatibilityRule;
use App\Services\Compatibility\Rules\SocketMatchRule;
use App\Services\Compatibility\Rules\StorageSlotsRule;

final class CompatibilityChecker
{
    /**
     * @param  list<CompatibilityRule>  $rules
     */
    public function __construct(private readonly array $rules) {}

    public static function make(): self
    {
        $powerCalculator = new PowerCalculator;

        return new self([
            new SocketMatchRule,
            new RamCompatibilityRule,
            new PsuWattageRule($powerCalculator),
            new GpuFitRule,
            new CoolerFitRule,
            new FormFactorRule,
            new StorageSlotsRule,
        ]);
    }

    /**
     * @return list<Violation>
     */
    public function violations(BuildSelection $build): array
    {
        $violations = [];

        foreach ($this->rules as $rule) {
            foreach ($rule->check($build) as $violation) {
                $violations[] = $violation;
            }
        }

        usort(
            $violations,
            fn (Violation $a, Violation $b): int => ($a->severity === Severity::Error ? 0 : 1)
                <=> ($b->severity === Severity::Error ? 0 : 1),
        );

        return $violations;
    }

    /**
     * @return list<Violation>
     */
    public function errors(BuildSelection $build): array
    {
        return array_values(array_filter(
            $this->violations($build),
            fn (Violation $violation): bool => $violation->severity === Severity::Error,
        ));
    }

    public function hasErrors(BuildSelection $build): bool
    {
        return $this->errors($build) !== [];
    }
}
