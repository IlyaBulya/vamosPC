<?php

namespace App\Services\Compatibility;

final readonly class Violation
{
    /**
     * @param  string  $rule  Machine key of the rule that produced this violation.
     * @param  list<string>  $componentTypes  ComponentType values involved, for anchoring in the UI.
     */
    public function __construct(
        public Severity $severity,
        public string $rule,
        public string $message,
        public array $componentTypes = [],
    ) {}

    /**
     * @param  list<string>  $componentTypes
     */
    public static function error(string $rule, string $message, array $componentTypes = []): self
    {
        return new self(Severity::Error, $rule, $message, $componentTypes);
    }

    /**
     * @param  list<string>  $componentTypes
     */
    public static function warning(string $rule, string $message, array $componentTypes = []): self
    {
        return new self(Severity::Warning, $rule, $message, $componentTypes);
    }

    /**
     * @return array{severity: string, rule: string, message: string, component_types: list<string>}
     */
    public function toArray(): array
    {
        return [
            'severity' => $this->severity->value,
            'rule' => $this->rule,
            'message' => $this->message,
            'component_types' => $this->componentTypes,
        ];
    }
}
