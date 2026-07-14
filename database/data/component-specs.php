<?php

/**
 * Structured specs for the seeded catalog, keyed by the product's exact
 * description (names repeat, descriptions are unique). Consumed by
 * ProductSeeder (fresh installs) and the backfill_component_specs
 * migration (existing databases). Field meanings: App\Support\Specs\SpecSchema.
 */

return [
    // Graphics cards
    'ASUS Dual GeForce RTX 5050 OC Edition 8GB GDDR6 Reflex 2 RTX AI DLSS4 Graphics Card' => [
        'length_mm' => 227,
        'tdp_watts' => 130,
        'recommended_psu_watts' => 550,
        'power_connectors' => '1x 8-pin',
        'vram_gb' => 8,
    ],
    'MSI GeForce RTX 5060 VENTUS 2X OC 8GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card' => [
        'length_mm' => 197,
        'tdp_watts' => 145,
        'recommended_psu_watts' => 550,
        'power_connectors' => '1x 8-pin',
        'vram_gb' => 8,
    ],
    'MSI GeForce RTX 5060 Ti VENTUS 2X OC PLUS 8GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card' => [
        'length_mm' => 232,
        'tdp_watts' => 180,
        'recommended_psu_watts' => 600,
        'power_connectors' => '1x 8-pin',
        'vram_gb' => 8,
    ],
    'MSI GeForce RTX 5070 VENTUS 2X OC 12GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card' => [
        'length_mm' => 232,
        'tdp_watts' => 250,
        'recommended_psu_watts' => 650,
        'power_connectors' => '1x 16-pin (12VHPWR)',
        'vram_gb' => 12,
    ],
    'Gigabyte GeForce RTX 5070 Ti EAGLE OC SFF 16GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card' => [
        'length_mm' => 280,
        'tdp_watts' => 300,
        'recommended_psu_watts' => 750,
        'power_connectors' => '1x 16-pin (12VHPWR)',
        'vram_gb' => 16,
    ],

    // Processors
    'AMD Ryzen 5 5500 3.6GHz Box Processor' => [
        'socket' => 'AM4',
        'tdp_watts' => 65,
        'supported_ram_types' => ['DDR4'],
        'has_igpu' => false,
    ],
    'AMD Ryzen 5 5600 3.5GHz Processor Box' => [
        'socket' => 'AM4',
        'tdp_watts' => 65,
        'supported_ram_types' => ['DDR4'],
        'has_igpu' => false,
    ],
    'AMD Ryzen 5 7500F 3.7/5 GHz Box Processor' => [
        'socket' => 'AM5',
        'tdp_watts' => 65,
        'supported_ram_types' => ['DDR5'],
        'has_igpu' => false,
    ],
    'AMD Ryzen 7 7800X3D 4.2 GHz/5 GHz Processor' => [
        'socket' => 'AM5',
        'tdp_watts' => 120,
        'supported_ram_types' => ['DDR5'],
        'has_igpu' => true,
    ],
    'AMD Ryzen 7 9800X3D 4.7/5.2GHz Processor' => [
        'socket' => 'AM5',
        'tdp_watts' => 120,
        'supported_ram_types' => ['DDR5'],
        'has_igpu' => true,
    ],

    // Motherboards
    'MSI A520M-A PRO Motherboard' => [
        'socket' => 'AM4',
        'chipset' => 'A520',
        'form_factor' => 'mATX',
        'ram_type' => 'DDR4',
        'ram_slots' => 2,
        'max_ram_gb' => 64,
        'm2_slots' => 1,
        'sata_ports' => 4,
    ],
    'PRO B550 AM4 DDR4 ATX Gigabit LAN M.2 CrossfireX Motherboard' => [
        'socket' => 'AM4',
        'chipset' => 'B550',
        'form_factor' => 'ATX',
        'ram_type' => 'DDR4',
        'ram_slots' => 4,
        'max_ram_gb' => 128,
        'm2_slots' => 2,
        'sata_ports' => 6,
    ],
    'MSI PRO B650-S WIFI Motherboard' => [
        'socket' => 'AM5',
        'chipset' => 'B650',
        'form_factor' => 'ATX',
        'ram_type' => 'DDR5',
        'ram_slots' => 4,
        'max_ram_gb' => 192,
        'm2_slots' => 2,
        'sata_ports' => 4,
    ],
    'Gigabyte B650 ATX Motherboard AM5 B650 EAGLE DDR5 PCIe 5.0 USB 3.2 Gen2 LAN GbE' => [
        'socket' => 'AM5',
        'chipset' => 'B650',
        'form_factor' => 'ATX',
        'ram_type' => 'DDR5',
        'ram_slots' => 4,
        'max_ram_gb' => 192,
        'm2_slots' => 2,
        'sata_ports' => 4,
    ],

    // Memory
    'Kingston FURY Beast DDR4 3200 MHz 16GB 2x8GB CL16 RAM Memory' => [
        'ram_type' => 'DDR4',
        'speed_mt' => 3200,
        'modules' => 2,
        'capacity_gb' => 16,
    ],
    'Adata XPG GAMMIX D35 DDR4 3200MHz 32GB 2x16GB CL16 Intel XMP 2.0 RAM Memory' => [
        'ram_type' => 'DDR4',
        'speed_mt' => 3200,
        'modules' => 2,
        'capacity_gb' => 32,
    ],
    'Corsair Vengeance DDR5 6000MHz 32GB (2x16GB) CL36 Dual Memory with AMD EXP and Intel XMP Support - Refurbished' => [
        'ram_type' => 'DDR5',
        'speed_mt' => 6000,
        'modules' => 2,
        'capacity_gb' => 32,
    ],

    // Storage
    'Intense Premium SSD 500GB M.2 NVMe PCIe 3.0 Hard Drive' => [
        'interface' => 'm2_nvme',
        'capacity_gb' => 500,
    ],
    'MSI SPATIUM M461 SSD 1TB NVMe M.2 Gen4x4 Hard Drive' => [
        'interface' => 'm2_nvme',
        'capacity_gb' => 1000,
    ],
    'Seagate Ironwolf NAS 4TB Hard Drive Internal HDD 3.5" SATA 3' => [
        'interface' => 'sata',
        'capacity_gb' => 4000,
    ],
    'Seagate IronWolf NAS 8TB Hard Drive Internal HDD 3.5" SATA 3' => [
        'interface' => 'sata',
        'capacity_gb' => 8000,
    ],

    // Power supplies
    'Yeyian Raiden 650W 80 Plus Bronze Power Supply' => [
        'wattage' => 650,
        'form_factor' => 'ATX',
        'length_mm' => 140,
        'pcie_connectors' => '2x 8-pin PCIe',
    ],
    'Nox 850W 80+ Gold Hummer GDM Modular ATX 3.1 Ultra Silent Power Supply' => [
        'wattage' => 850,
        'form_factor' => 'ATX',
        'length_mm' => 160,
        'pcie_connectors' => '1x 16-pin (12VHPWR), 2x 8-pin PCIe',
    ],

    // Cooling
    'Nox HUMMER H-400 CPU Fan 120mm Black' => [
        'cooler_type' => 'air',
        'sockets' => ['AM4', 'AM5', 'LGA1700', 'LGA1200', 'LGA115X'],
        'height_mm' => 153,
        'tdp_rating_watts' => 150,
    ],
    'Forgeon Azoth 360 ARGB Liquid Cooling Kit 360mm Black' => [
        'cooler_type' => 'aio',
        'sockets' => ['AM4', 'AM5', 'LGA1700', 'LGA1200'],
        'radiator_mm' => 360,
        'tdp_rating_watts' => 350,
    ],
    'NZXT Kraken X63 Refurbished Liquid Cooling Kit' => [
        'cooler_type' => 'aio',
        'sockets' => ['AM4', 'AM5', 'LGA1700', 'LGA1200'],
        'radiator_mm' => 280,
        'tdp_rating_watts' => 300,
    ],

    // Cases
    'Mars Gaming MC-iPRO - Caja ATX' => [
        'mobo_form_factors' => ['ATX', 'mATX', 'ITX'],
        'max_gpu_length_mm' => 320,
        'max_cooler_height_mm' => 160,
        'radiator_support' => [120, 240],
        'psu_form_factor' => 'ATX',
    ],
    'Mars Gaming MC-FUSION Gaming ATX PC Tower with Continuous Curved Dual Chamber Tempered Glass, Black' => [
        'mobo_form_factors' => ['ATX', 'mATX', 'ITX'],
        'max_gpu_length_mm' => 400,
        'max_cooler_height_mm' => 175,
        'radiator_support' => [120, 240, 280, 360],
        'psu_form_factor' => 'ATX',
    ],
    'darkFlash DY570 - ATX Case' => [
        'mobo_form_factors' => ['ATX', 'mATX', 'ITX'],
        'max_gpu_length_mm' => 380,
        'max_cooler_height_mm' => 170,
        'radiator_support' => [120, 240, 280, 360],
        'psu_form_factor' => 'ATX',
    ],

    // Case fans
    'DeepCool FT12 Auxiliary Fan 120mm Black' => [
        'size_mm' => 120,
    ],
];
