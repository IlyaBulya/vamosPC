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
                'name' => 'processors',
                'type' => 'hardware',
                'description' => 'Processors for everyday, gaming, and productivity builds.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'motherboards',
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
                'name' => 'cases',
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
        ]);
    }
}
