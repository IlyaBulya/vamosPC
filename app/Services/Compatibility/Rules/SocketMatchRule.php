<?php

namespace App\Services\Compatibility\Rules;

use App\Enums\ComponentType;
use App\Services\Compatibility\BuildSelection;
use App\Services\Compatibility\CompatibilityRule;
use App\Services\Compatibility\Violation;

class SocketMatchRule implements CompatibilityRule
{
    public function check(BuildSelection $build): array
    {
        $violations = [];

        $cpuSocket = $build->firstOfType(ComponentType::Cpu)?->spec('socket');
        $moboSocket = $build->firstOfType(ComponentType::Motherboard)?->spec('socket');

        if (is_string($cpuSocket) && is_string($moboSocket) && $cpuSocket !== $moboSocket) {
            $violations[] = Violation::error(
                'socket_match',
                "CPU socket {$cpuSocket} does not fit the motherboard's {$moboSocket} socket.",
                [ComponentType::Cpu->value, ComponentType::Motherboard->value],
            );
        }

        $coolerSockets = $build->firstOfType(ComponentType::Cooler)?->spec('sockets');

        if (is_string($cpuSocket) && is_array($coolerSockets) && ! in_array($cpuSocket, $coolerSockets, true)) {
            $violations[] = Violation::error(
                'socket_match',
                "The cooler does not support the CPU's {$cpuSocket} socket.",
                [ComponentType::Cooler->value, ComponentType::Cpu->value],
            );
        }

        return $violations;
    }
}
