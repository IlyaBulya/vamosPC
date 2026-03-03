<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'name' => 'graphics-card',
                'type' => 'hardware',
                'description' => 'Graphics cards for gaming and visual performance.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'processor',
                'type' => 'hardware',
                'description' => 'Processors for everyday, gaming, and productivity builds.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'motherboard',
                'type' => 'hardware',
                'description' => 'Motherboards that connect and power all core components.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'cooling',
                'type' => 'hardware',
                'description' => 'Cooling solutions for stable system temperatures.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'memory',
                'type' => 'hardware',
                'description' => 'Memory kits for smooth multitasking and performance.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ssd',
                'type' => 'hardware',
                'description' => 'Solid-state drives for fast storage and boot times.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'hdd',
                'type' => 'hardware',
                'description' => 'Hard drives for larger-capacity storage needs.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'power-supply',
                'type' => 'hardware',
                'description' => 'Power supplies that deliver reliable system power.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'case',
                'type' => 'hardware',
                'description' => 'PC cases for housing and airflow management.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'additional-cooling',
                'type' => 'hardware',
                'description' => 'Extra fans and airflow accessories for better cooling.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'monitor',
                'type' => 'accessorie',
                'description' => 'Monitors for gaming, work, and everyday use.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'keyboard',
                'type' => 'accessorie',
                'description' => 'Keyboards for gaming, typing, and productivity.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'mouse',
                'type' => 'accessorie',
                'description' => 'Computer mice for precision, comfort, and control.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'headset',
                'type' => 'accessorie',
                'description' => 'Headsets for gaming, calls, and immersive audio.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'mouse-pad',
                'type' => 'accessorie',
                'description' => 'Mouse pads that improve tracking and desk comfort.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'microphone',
                'type' => 'accessorie',
                'description' => 'Microphones for streaming, recording, and communication.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'asus',
                'type' => 'laptop',
                'description' => 'Asus laptops for gaming, work, and everyday use.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'gigabyte',
                'type' => 'laptop',
                'description' => 'Gigabyte laptops focused on performance and gaming.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'lenovo',
                'type' => 'laptop',
                'description' => 'Lenovo laptops for business, study, and daily use.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'msi',
                'type' => 'laptop',
                'description' => 'MSI laptops built for gaming and high performance.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
