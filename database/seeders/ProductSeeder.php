<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $products = [
            [
                'category' => 'graphics-card',
                'name' => '5050 ASUS',
                'description' => 'ASUS Dual GeForce RTX 5050 OC Edition 8GB GDDR6 Reflex 2 RTX AI DLSS4 Graphics Card',
                'price_in_cents' => 26995,
                'is_component' => true,
            ],
            [
                'category' => 'graphics-card',
                'name' => '5060 MSI',
                'description' => 'MSI GeForce RTX 5060 VENTUS 2X OC 8GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card',
                'price_in_cents' => 31990,
                'is_component' => true,
            ],
            [
                'category' => 'graphics-card',
                'name' => 'RTX 5060 Ti',
                'description' => 'MSI GeForce RTX 5060 Ti VENTUS 2X OC PLUS 8GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card',
                'price_in_cents' => 42398,
                'is_component' => true,
            ],
            [
                'category' => 'graphics-card',
                'name' => 'RTX 5070',
                'description' => 'MSI GeForce RTX 5070 VENTUS 2X OC 12GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card',
                'price_in_cents' => 63900,
                'is_component' => true,
            ],
            [
                'category' => 'graphics-card',
                'name' => 'RTX 5070 TI',
                'description' => 'Gigabyte GeForce RTX 5070 Ti EAGLE OC SFF 16GB GDDR7 Reflex 2 RTX AI DLSS4 Graphics Card',
                'price_in_cents' => 107000,
                'is_component' => true,
            ],
            [
                'category' => 'processor',
                'name' => 'AMD Ryzen 5',
                'description' => 'AMD Ryzen 5 5500 3.6GHz Box Processor',
                'price_in_cents' => 7990,
                'is_component' => true,
            ],
            [
                'category' => 'processor',
                'name' => 'AMD Ryzen 5',
                'description' => 'AMD Ryzen 5 5600 3.5GHz Processor Box',
                'price_in_cents' => 13470,
                'is_component' => true,
            ],
            [
                'category' => 'processor',
                'name' => 'AMD Ryzen 5',
                'description' => 'AMD Ryzen 5 7500F 3.7/5 GHz Box Processor',
                'price_in_cents' => 16340,
                'is_component' => true,
            ],
            [
                'category' => 'processor',
                'name' => 'AMD Ryzen 7',
                'description' => 'AMD Ryzen 7 7800X3D 4.2 GHz/5 GHz Processor',
                'price_in_cents' => 38990,
                'is_component' => true,
            ],
            [
                'category' => 'processor',
                'name' => 'AMD Ryzen 7',
                'description' => 'AMD Ryzen 7 9800X3D 4.7/5.2GHz Processor',
                'price_in_cents' => 44495,
                'is_component' => true,
            ],
            [
                'category' => 'motherboard',
                'name' => 'MSI A520M-A',
                'description' => 'MSI A520M-A PRO Motherboard',
                'price_in_cents' => 5199,
                'is_component' => true,
            ],
            [
                'category' => 'motherboard',
                'name' => 'MSI B550-A',
                'description' => 'PRO B550 AM4 DDR4 ATX Gigabit LAN M.2 CrossfireX Motherboard',
                'price_in_cents' => 11291,
                'is_component' => true,
            ],
            [
                'category' => 'motherboard',
                'name' => 'MSI PRO B650-S',
                'description' => 'MSI PRO B650-S WIFI Motherboard',
                'price_in_cents' => 19303,
                'is_component' => true,
            ],
            [
                'category' => 'motherboard',
                'name' => 'Gigabyte B650',
                'description' => 'Gigabyte B650 ATX Motherboard AM5 B650 EAGLE DDR5 PCIe 5.0 USB 3.2 Gen2 LAN GbE',
                'price_in_cents' => 113499,
                'is_component' => true,
            ],
            [
                'category' => 'memory',
                'name' => 'RAM DDR4 8X2 KINGSTON FURY',
                'description' => 'Kingston FURY Beast DDR4 3200 MHz 16GB 2x8GB CL16 RAM Memory',
                'price_in_cents' => 16995,
                'is_component' => true,
            ],
            [
                'category' => 'memory',
                'name' => 'DDR 4 2x16 GB',
                'description' => 'Adata XPG GAMMIX D35 DDR4 3200MHz 32GB 2x16GB CL16 Intel XMP 2.0 RAM Memory',
                'price_in_cents' => 26295,
                'is_component' => true,
            ],
            [
                'category' => 'memory',
                'name' => 'RAM 2x16 GB DDR5',
                'description' => 'Corsair Vengeance DDR5 6000MHz 32GB (2x16GB) CL36 Dual Memory with AMD EXP and Intel XMP Support - Refurbished',
                'price_in_cents' => 45880,
                'is_component' => true,
            ],
            [
                'category' => 'ssd',
                'name' => 'SSD 500 GB',
                'description' => 'Intense Premium SSD 500GB M.2 NVMe PCIe 3.0 Hard Drive',
                'price_in_cents' => 9599,
                'is_component' => true,
            ],
            [
                'category' => 'ssd',
                'name' => 'MSI SSD 1TB',
                'description' => 'MSI SPATIUM M461 SSD 1TB NVMe M.2 Gen4x4 Hard Drive',
                'price_in_cents' => 16995,
                'is_component' => true,
            ],
            [
                'category' => 'power-supply',
                'name' => '650 W BRONZE CERTIFICATE',
                'description' => 'Yeyian Raiden 650W 80 Plus Bronze Power Supply',
                'price_in_cents' => 4499,
                'is_component' => true,
            ],
            [
                'category' => 'power-supply',
                'name' => 'Nox 850W',
                'description' => 'Nox 850W 80+ Gold Hummer GDM Modular ATX 3.1 Ultra Silent Power Supply',
                'price_in_cents' => 9480,
                'is_component' => true,
            ],
            [
                'category' => 'cooling',
                'name' => 'Nox HUMMER H-400',
                'description' => 'Nox HUMMER H-400 CPU Fan 120mm Black',
                'price_in_cents' => 3590,
                'is_component' => true,
            ],
            [
                'category' => 'cooling',
                'name' => 'Forgeon Azoth 360 ARGB',
                'description' => 'Forgeon Azoth 360 ARGB Liquid Cooling Kit 360mm Black',
                'price_in_cents' => 8299,
                'is_component' => true,
            ],
            [
                'category' => 'cooling',
                'name' => 'COOLER NZXT',
                'description' => 'NZXT Kraken X63 Refurbished Liquid Cooling Kit',
                'price_in_cents' => 10999,
                'is_component' => true,
            ],
            [
                'category' => 'hdd',
                'name' => 'Seagate Ironwolf NAS 4TB',
                'description' => 'Seagate Ironwolf NAS 4TB Hard Drive Internal HDD 3.5" SATA 3',
                'price_in_cents' => 16995,
                'is_component' => true,
            ],
            [
                'category' => 'hdd',
                'name' => 'Seagate IronWolf NAS 8TB',
                'description' => 'Seagate IronWolf NAS 8TB Hard Drive Internal HDD 3.5" SATA 3',
                'price_in_cents' => 29900,
                'is_component' => true,
            ],
            [
                'category' => 'case',
                'name' => 'Mars Gaming MC-iPRO',
                'description' => 'Mars Gaming MC-iPRO - Caja ATX',
                'price_in_cents' => 4289,
                'is_component' => true,
            ],
            [
                'category' => 'case',
                'name' => 'Mars Gaming MC-FUSION',
                'description' => 'Mars Gaming MC-FUSION Gaming ATX PC Tower with Continuous Curved Dual Chamber Tempered Glass, Black',
                'price_in_cents' => 6291,
                'is_component' => true,
            ],
            [
                'category' => 'case',
                'name' => 'darkFlash DY570',
                'description' => 'darkFlash DY570 - ATX Case',
                'price_in_cents' => 15489,
                'is_component' => true,
            ],
            [
                'category' => 'additional-cooling',
                'name' => 'DeepCool FT12',
                'description' => 'DeepCool FT12 Auxiliary Fan 120mm Black',
                'price_in_cents' => 5700,
                'is_component' => true,
            ],
            [
                'category' => 'monitor',
                'name' => 'AOC C27G4ZXE 27"',
                'description' => 'AOC C27G4ZXE 27" LED Fast VA FullHD 280Hz 1ms Curve Monitor',
                'price_in_cents' => 14900,
                'is_component' => false,
            ],
            [
                'category' => 'monitor',
                'name' => 'Monitor MSI MAG 274F 27"',
                'description' => 'Monitor MSI MAG 274F 27" LED Fast IPS FullHD 200Hz 0.5ms Adaptive Sync',
                'price_in_cents' => 11900,
                'is_component' => false,
            ],
            [
                'category' => 'monitor',
                'name' => 'Monitor AOC Q27G4XF 27"',
                'description' => 'Monitor AOC Q27G4XF 27" LED Fast IPS QHD 180Hz',
                'price_in_cents' => 16900,
                'is_component' => false,
            ],
            [
                'category' => 'keyboard',
                'name' => 'Wireless RGB Gaming Keyboard',
                'description' => 'Forgeon Meteor Wireless RGB Gaming Keyboard 98% Black',
                'price_in_cents' => 5999,
                'is_component' => false,
            ],
            [
                'category' => 'keyboard',
                'name' => 'PRO Wireless Mechanical Gaming Keyboard',
                'description' => 'Newskill Pyros PRO Wireless Mechanical Gaming Keyboard 75% Hotswap Black',
                'price_in_cents' => 6499,
                'is_component' => false,
            ],
            [
                'category' => 'keyboard',
                'name' => 'Keychron K3 Max Wireless Mechanical Keyboard ES',
                'description' => 'Keychron K3 Max Wireless Mechanical Keyboard ES Layout Backlit Gateron Red Low Profile Switch',
                'price_in_cents' => 10300,
                'is_component' => false,
            ],
            [
                'category' => 'mouse',
                'name' => 'Logitech G305 LightSpeed',
                'description' => 'Logitech G305 LightSpeed Wireless Gaming Mouse 12000DPI Black',
                'price_in_cents' => 4190,
                'is_component' => false,
            ],
            [
                'category' => 'mouse',
                'name' => 'Logitech G203 Lightsync',
                'description' => 'Logitech G203 Lightsync 2nd Gen Gaming Mouse 8000DPI RGB Black',
                'price_in_cents' => 3484,
                'is_component' => false,
            ],
            [
                'category' => 'mouse',
                'name' => 'Razer Viper V3 Pro',
                'description' => 'Razer Viper V3 Pro Wireless Gaming Mouse 35000 DPI Black',
                'price_in_cents' => 13999,
                'is_component' => false,
            ],
            [
                'category' => 'headset',
                'name' => 'Logitech G Pro X',
                'description' => 'Logitech G Pro X Wireless Gaming Headset with Lightspeed (Black)',
                'price_in_cents' => 19990,
                'is_component' => false,
            ],
            [
                'category' => 'headset',
                'name' => 'Logitech G435 LIGHTSPEED',
                'description' => 'Logitech G435 LIGHTSPEED Wireless Gaming Headset Black',
                'price_in_cents' => 6011,
                'is_component' => false,
            ],
            [
                'category' => 'headset',
                'name' => 'Forgeon General Wireless',
                'description' => 'Forgeon General Wireless Gaming Headphones PC/PS4/PS5/Xbox/Xbox X/Switch Black',
                'price_in_cents' => 6499,
                'is_component' => false,
            ],
            [
                'category' => 'mouse-pad',
                'name' => 'SteelSeries QcK Performance',
                'description' => 'SteelSeries QcK Performance L Balance Gaming Mousepad Black',
                'price_in_cents' => 3599,
                'is_component' => false,
            ],
            [
                'category' => 'mouse-pad',
                'name' => 'Razer Strider XXL',
                'description' => 'Razer Strider XXL Hybrid Gaming Mousepad',
                'price_in_cents' => 5999,
                'is_component' => false,
            ],
            [
                'category' => 'mouse-pad',
                'name' => 'Zowie PTF-X',
                'description' => 'Zowie PTF-X Black Gaming Mouse Pad',
                'price_in_cents' => 4925,
                'is_component' => false,
            ],
            [
                'category' => 'microphone',
                'name' => 'HyperX Quadcast 2',
                'description' => 'HyperX Quadcast 2 USB Condenser Streaming Microphone - Black',
                'price_in_cents' => 9999,
                'is_component' => false,
            ],
            [
                'category' => 'microphone',
                'name' => 'Blue Microphones Yeti',
                'description' => 'Blue Microphones Yeti Black USB Microphone for PC Recording and Streaming',
                'price_in_cents' => 10999,
                'is_component' => false,
            ],
            [
                'category' => 'microphone',
                'name' => 'HyperX FlipCast',
                'description' => 'HyperX FlipCast USB/XLR Dynamic Microphone with Articulating Boom Arm, Black',
                'price_in_cents' => 21442,
                'is_component' => false,
            ],
            [
                'category' => 'asus',
                'name' => 'Laptop ASUS V16',
                'description' => 'Laptop ASUS V16 V3607VM-RP010 Intel Core 7 240H/32GB/1TB SSD/RTX 5060/16"',
                'price_in_cents' => 116900,
                'is_component' => false,
            ],
            [
                'category' => 'asus',
                'name' => 'Laptop ASUS V16',
                'description' => 'Laptop ASUS V16 V3607VU-RP099 Intel Core 7 240H/16GB/512GB SSD/RTX 4050/16"',
                'price_in_cents' => 105900,
                'is_component' => false,
            ],
            [
                'category' => 'asus',
                'name' => 'Laptop ASUS V16',
                'description' => 'Laptop ASUS V16 V3607VU-RP148 Intel Core 5 210H/16GB/512GB SSD/RTX 4050/16"',
                'price_in_cents' => 103900,
                'is_component' => false,
            ],
            [
                'category' => 'gigabyte',
                'name' => 'GIGABYTE Gaming A16',
                'description' => 'GIGABYTE Gaming A16 Laptop 16" Intel Core i7-13620H 16GB 1TB SSD RTX 5060 8GB Dolby Atmos',
                'price_in_cents' => 109900,
                'is_component' => false,
            ],
            [
                'category' => 'gigabyte',
                'name' => 'GIGABYTE Gaming A16',
                'description' => 'GIGABYTE Gaming A16 Laptop 16" Intel Core i7-13620H 16GB 1TB SSD RTX 5050 8GB Dolby Atmos',
                'price_in_cents' => 104900,
                'is_component' => false,
            ],
            [
                'category' => 'gigabyte',
                'name' => 'Gigabyte G5',
                'description' => 'Gigabyte G5 MF5-52PT354SD Laptop Intel Core i5-13500H/16GB/1TB SSD/RTX 4050/15.6" (PT)',
                'price_in_cents' => 99900,
                'is_component' => false,
            ],
            [
                'category' => 'lenovo',
                'name' => 'Laptop Lenovo LOQ',
                'description' => 'Laptop Lenovo LOQ Essential 15IRX11 15.6" Intel Core i5-13450HX 16GB 512GB SSD RTX 5050 FreeDOS',
                'price_in_cents' => 79900,
                'is_component' => false,
            ],
            [
                'category' => 'lenovo',
                'name' => 'Laptop Lenovo LOQ',
                'description' => "Laptop Lenovo LOQ Essential 15IRX11-284 Intel Core i7-13650HX/16GB/512GB SSD/RTX 5050/15.6'' (PT)",
                'price_in_cents' => 89999,
                'is_component' => false,
            ],
            [
                'category' => 'msi',
                'name' => 'Laptop MSI Cyborg 15',
                'description' => 'Laptop MSI Cyborg 15 B2RWFKG-201XES Intel Core 7 240H 32GB DDR5 1TB SSD RTX 5060 15.6" FHD RGB',
                'price_in_cents' => 129900,
                'is_component' => false,
            ],
            [
                'category' => 'msi',
                'name' => 'MSI Vector 16',
                'description' => 'MSI Vector 16 HX AI A2XWHG-097XES Intel Core Ultra 7 255HX 32GB 1TB SSD RTX 5070 Ti 16" Laptop',
                'price_in_cents' => 189900,
                'is_component' => false,
            ],
            [
                'category' => 'msi',
                'name' => 'Laptop MSI Cyborg',
                'description' => 'Laptop MSI Cyborg A15 AI B2HWFKG-094XES 15.6" AMD Ryzen 9 270 64GB 1TB SSD RTX 5060 8GB Translucent Black',
                'price_in_cents' => 145900,
                'is_component' => false,
            ],
        ];

        $categorySlugs = array_values(array_unique(array_column($products, 'category')));
        $categoryIds = DB::table('categories')
            ->whereIn('name', $categorySlugs)
            ->pluck('id', 'name')
            ->all();

        $missingCategories = array_diff($categorySlugs, array_keys($categoryIds));
        if ($missingCategories !== []) {
            throw new RuntimeException(
                'Missing categories for ProductSeeder: ' . implode(', ', $missingCategories)
                );
        }

        DB::table('products')->insert(array_map(
        fn(array $product): array => [
        'category_id' => $categoryIds[$product['category']],
        'name' => $product['name'],
        'description' => $product['description'],
        'price_in_cents' => $product['price_in_cents'],
        'is_component' => $product['is_component'],
        'created_at' => $now,
        'updated_at' => $now,
        ],
            $products
        ));
    }
}