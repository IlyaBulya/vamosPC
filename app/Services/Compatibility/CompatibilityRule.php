<?php

namespace App\Services\Compatibility;

interface CompatibilityRule
{
    /**
     * Check one aspect of the build. Rules must degrade gracefully:
     * a missing spec means "cannot verify" and produces no violation,
     * never an error.
     *
     * @return list<Violation>
     */
    public function check(BuildSelection $build): array;
}
