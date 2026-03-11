<?php

namespace App\Support;

class DemoGamingBuilds
{
    /**
     * @return list<array{
     *     slug:string,
     *     name:string,
     *     specs:string,
     *     price_label:string,
     *     availability_label:string,
     *     base_price_in_cents:int,
     *     target:string,
     *     gaming_target:string,
     *     thermal_profile:string,
     *     upgrade_headroom:string,
     *     graphics_card:string,
     *     processor:string,
     *     motherboard:string,
     *     cooling:string,
     *     memory:string,
     *     storage:string,
     *     power_supply:string,
     *     case:string
     * }>
     */
    public static function all(): array
    {
        return [
            [
                'slug' => 'starter-core',
                'name' => 'Starter Core',
                'specs' => 'Intel Core i5 / RTX 4060 / 16GB RAM / 1TB SSD',
                'price_label' => 'from EUR 1,299',
                'availability_label' => 'Ready to configure',
                'base_price_in_cents' => 129900,
                'target' => 'Balanced entry build for smooth 1080p gaming.',
                'gaming_target' => '1080p High',
                'thermal_profile' => 'Balanced',
                'upgrade_headroom' => 'Good',
                'graphics_card' => 'Palit GeForce RTX 4060 Dual 8GB',
                'processor' => 'Intel Core i5-14600KF',
                'motherboard' => 'MSI B760 Gaming Plus WiFi',
                'cooling' => 'DeepCool LE360 V2 Black',
                'memory' => '16GB Kingston Fury Beast DDR5-5600',
                'storage' => '1TB MSI Spatium NVMe SSD',
                'power_supply' => '650W Bronze Certified PSU',
                'case' => 'Mars Gaming MC-iPRO',
            ],
            [
                'slug' => 'performance-x',
                'name' => 'Performance X',
                'specs' => 'AMD Ryzen 7 / RTX 5070 / 32GB RAM / 2TB SSD',
                'price_label' => 'from EUR 2,199',
                'availability_label' => 'Performance tier',
                'base_price_in_cents' => 219900,
                'target' => 'High-refresh 1440p gaming and streaming.',
                'gaming_target' => '1440p Ultra',
                'thermal_profile' => 'Optimized',
                'upgrade_headroom' => 'High',
                'graphics_card' => 'GeForce RTX 5070 12GB',
                'processor' => 'AMD Ryzen 7 7700',
                'motherboard' => 'MSI B850 Gaming Plus WiFi',
                'cooling' => 'Forgeon Azoth 360 ARGB',
                'memory' => '32GB Kingston Fury Beast RGB DDR5-6000',
                'storage' => '2TB MSI SSD NVMe',
                'power_supply' => 'Nox 850W Gold',
                'case' => 'darkFlash DY570',
            ],
            [
                'slug' => 'ultra-apex',
                'name' => 'Ultra Apex',
                'specs' => 'Intel Core i9 / RTX 5090 / 64GB RAM / 4TB SSD',
                'price_label' => 'from EUR 3,999',
                'availability_label' => 'Flagship class',
                'base_price_in_cents' => 399900,
                'target' => '4K gaming and workstation-grade heavy loads.',
                'gaming_target' => '4K Ultra',
                'thermal_profile' => 'Advanced Cooling',
                'upgrade_headroom' => 'Maximum',
                'graphics_card' => 'GeForce RTX 5090 32GB',
                'processor' => 'Intel Core i9-14900K',
                'motherboard' => 'ASUS ROG Maximus Z790 Hero',
                'cooling' => 'Custom 420mm liquid cooling',
                'memory' => '64GB G.Skill Trident Z5 DDR5-6400',
                'storage' => '4TB Samsung 990 Pro NVMe SSD',
                'power_supply' => '1200W Platinum PSU',
                'case' => 'Lian Li O11D EVO RGB',
            ],
        ];
    }

    /**
     * @return array{
     *     slug:string,
     *     name:string,
     *     specs:string,
     *     price_label:string,
     *     availability_label:string,
     *     base_price_in_cents:int,
     *     target:string,
     *     gaming_target:string,
     *     thermal_profile:string,
     *     upgrade_headroom:string,
     *     graphics_card:string,
     *     processor:string,
     *     motherboard:string,
     *     cooling:string,
     *     memory:string,
     *     storage:string,
     *     power_supply:string,
     *     case:string
     * }|null
     */
    public static function find(string $slug): ?array
    {
        foreach (self::all() as $build) {
            if ($build['slug'] === $slug) {
                return $build;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    public static function slugs(): array
    {
        return array_map(
            static fn (array $build): string => $build['slug'],
            self::all(),
        );
    }
}
