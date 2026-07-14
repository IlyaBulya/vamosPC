<?php

namespace App\Support\Specs;

use App\Enums\ComponentType;

/**
 * Single source of truth for which structured specs each component type
 * carries. Drives admin validation now and the compatibility engine later.
 *
 * Field shape: key => [type, unit?, options?]
 *  - type: 'integer' | 'string' | 'boolean' | 'enum' | 'enum_list'
 *  - options: allowed values for enum / enum_list fields
 *
 * Mirrored in resources/js/lib/spec-schema.ts — keep both in sync.
 */
class SpecSchema
{
    public const RAM_TYPES = ['DDR4', 'DDR5'];

    public const MOBO_FORM_FACTORS = ['E-ATX', 'ATX', 'mATX', 'ITX'];

    public const PSU_FORM_FACTORS = ['ATX', 'SFX'];

    public const STORAGE_INTERFACES = ['m2_nvme', 'sata'];

    public const COOLER_TYPES = ['air', 'aio'];

    public const RADIATOR_SIZES = [120, 240, 280, 360, 420];

    /**
     * @return array<string, array{type: string, unit?: string, options?: array<int, string|int>}>
     */
    public static function fieldsFor(ComponentType $type): array
    {
        return match ($type) {
            ComponentType::Cpu => [
                'socket' => ['type' => 'string'],
                'tdp_watts' => ['type' => 'integer', 'unit' => 'W'],
                'supported_ram_types' => ['type' => 'enum_list', 'options' => self::RAM_TYPES],
                'has_igpu' => ['type' => 'boolean'],
            ],
            ComponentType::Gpu => [
                'length_mm' => ['type' => 'integer', 'unit' => 'mm'],
                'tdp_watts' => ['type' => 'integer', 'unit' => 'W'],
                'recommended_psu_watts' => ['type' => 'integer', 'unit' => 'W'],
                'power_connectors' => ['type' => 'string'],
                'vram_gb' => ['type' => 'integer', 'unit' => 'GB'],
            ],
            ComponentType::Motherboard => [
                'socket' => ['type' => 'string'],
                'chipset' => ['type' => 'string'],
                'form_factor' => ['type' => 'enum', 'options' => self::MOBO_FORM_FACTORS],
                'ram_type' => ['type' => 'enum', 'options' => self::RAM_TYPES],
                'ram_slots' => ['type' => 'integer'],
                'max_ram_gb' => ['type' => 'integer', 'unit' => 'GB'],
                'm2_slots' => ['type' => 'integer'],
                'sata_ports' => ['type' => 'integer'],
            ],
            ComponentType::Cooler => [
                'cooler_type' => ['type' => 'enum', 'options' => self::COOLER_TYPES],
                'sockets' => ['type' => 'enum_list', 'options' => []],
                'height_mm' => ['type' => 'integer', 'unit' => 'mm'],
                'radiator_mm' => ['type' => 'enum', 'options' => self::RADIATOR_SIZES],
                'tdp_rating_watts' => ['type' => 'integer', 'unit' => 'W'],
            ],
            ComponentType::Ram => [
                'ram_type' => ['type' => 'enum', 'options' => self::RAM_TYPES],
                'speed_mt' => ['type' => 'integer', 'unit' => 'MT/s'],
                'modules' => ['type' => 'integer'],
                'capacity_gb' => ['type' => 'integer', 'unit' => 'GB'],
            ],
            ComponentType::Storage => [
                'interface' => ['type' => 'enum', 'options' => self::STORAGE_INTERFACES],
                'capacity_gb' => ['type' => 'integer', 'unit' => 'GB'],
            ],
            ComponentType::Psu => [
                'wattage' => ['type' => 'integer', 'unit' => 'W'],
                'form_factor' => ['type' => 'enum', 'options' => self::PSU_FORM_FACTORS],
                'length_mm' => ['type' => 'integer', 'unit' => 'mm'],
                'pcie_connectors' => ['type' => 'string'],
            ],
            ComponentType::Case => [
                'mobo_form_factors' => ['type' => 'enum_list', 'options' => self::MOBO_FORM_FACTORS],
                'max_gpu_length_mm' => ['type' => 'integer', 'unit' => 'mm'],
                'max_cooler_height_mm' => ['type' => 'integer', 'unit' => 'mm'],
                'radiator_support' => ['type' => 'enum_list', 'options' => self::RADIATOR_SIZES],
                'psu_form_factor' => ['type' => 'enum', 'options' => self::PSU_FORM_FACTORS],
            ],
            ComponentType::CaseFan => [
                'size_mm' => ['type' => 'integer', 'unit' => 'mm'],
            ],
            ComponentType::ThermalPaste => [],
        };
    }

    /**
     * Laravel validation rules for a `specs` payload of the given type,
     * keyed as `specs.<field>`. All fields are optional: specs may be
     * filled in gradually and the compatibility engine degrades gracefully.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function rulesFor(ComponentType $type): array
    {
        $rules = [];

        foreach (self::fieldsFor($type) as $key => $field) {
            $rules["specs.{$key}"] = match ($field['type']) {
                'integer' => ['nullable', 'integer', 'min:0'],
                'boolean' => ['nullable', 'boolean'],
                'enum' => ['nullable', 'in:'.implode(',', array_map('strval', $field['options']))],
                'enum_list' => $field['options'] === []
                    ? ['nullable', 'array']
                    : ['nullable', 'array'],
                default => ['nullable', 'string', 'max:255'],
            };

            if ($field['type'] === 'enum_list' && $field['options'] !== []) {
                $rules["specs.{$key}.*"] = ['in:'.implode(',', array_map('strval', $field['options']))];
            } elseif ($field['type'] === 'enum_list') {
                $rules["specs.{$key}.*"] = ['string', 'max:255'];
            }
        }

        return $rules;
    }

    /**
     * Drop unknown keys and empty values from a specs payload and cast the
     * remaining values to their schema types (form submissions arrive as
     * strings), so only clean, typed fields are persisted.
     *
     * @param  array<string, mixed>  $specs
     * @return array<string, mixed>|null
     */
    public static function filter(ComponentType $type, array $specs): ?array
    {
        $castScalar = fn ($value) => is_string($value) && ctype_digit($value)
            ? (int) $value
            : $value;

        $filtered = [];

        foreach (self::fieldsFor($type) as $key => $field) {
            $value = $specs[$key] ?? null;

            if ($value === null || $value === '' || $value === []) {
                continue;
            }

            $filtered[$key] = match ($field['type']) {
                'integer' => (int) $value,
                'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'enum' => $castScalar($value),
                'enum_list' => array_values(array_map($castScalar, (array) $value)),
                default => (string) $value,
            };
        }

        return $filtered === [] ? null : $filtered;
    }
}
