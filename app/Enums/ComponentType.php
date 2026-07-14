<?php

namespace App\Enums;

enum ComponentType: string
{
    case Gpu = 'gpu';
    case Cpu = 'cpu';
    case Motherboard = 'motherboard';
    case Cooler = 'cooler';
    case Ram = 'ram';
    case Storage = 'storage';
    case Psu = 'psu';
    case Case = 'case';
    case CaseFan = 'case_fan';
    case ThermalPaste = 'thermal_paste';

    /**
     * Map a legacy category slug (categories.name) to a component type.
     */
    public static function fromCategoryName(?string $categoryName): ?self
    {
        return match ($categoryName) {
            'graphics-card' => self::Gpu,
            'processor' => self::Cpu,
            'motherboard' => self::Motherboard,
            'cooling' => self::Cooler,
            'memory' => self::Ram,
            'ssd', 'hdd' => self::Storage,
            'power-supply' => self::Psu,
            'case' => self::Case,
            'additional-cooling' => self::CaseFan,
            'thermal-paste' => self::ThermalPaste,
            default => null,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Gpu => 'Graphics Card',
            self::Cpu => 'Processor',
            self::Motherboard => 'Motherboard',
            self::Cooler => 'Cooling',
            self::Ram => 'Memory',
            self::Storage => 'Storage',
            self::Psu => 'Power Supply',
            self::Case => 'Case',
            self::CaseFan => 'Case Fans',
            self::ThermalPaste => 'Thermal Interface',
        };
    }

    /**
     * Canonical display order for configurator slots.
     */
    public function sortOrder(): int
    {
        return match ($this) {
            self::Gpu => 10,
            self::Cpu => 20,
            self::Motherboard => 30,
            self::Cooler => 40,
            self::Ram => 50,
            self::Storage => 60,
            self::Psu => 70,
            self::Case => 80,
            self::CaseFan => 90,
            self::ThermalPaste => 100,
        };
    }
}
