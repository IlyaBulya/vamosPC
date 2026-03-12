<?php

namespace Database\Seeders;

use App\Models\Configuration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configurations = [
            [
                'name' => 'VAMOS X',
                'description' => null,
                'image' => null,
                'price' => 120000,
                'homepage_order' => 1,
                'products' => [1, 6, 11, 15, 18, 20, 22, 27, 30],
            ],
            [
                'name' => 'VAMOS Z',
                'description' => null,
                'image' => null,
                'price' => 159999,
                'homepage_order' => 2,
                'products' => [2, 7, 12, 16, 18, 20, 23, 28, 30],
            ],
            [
                'name' => 'VAMOS PRO',
                'description' => null,
                'image' => null,
                'price' => 209900,
                'homepage_order' => 3,
                'products' => [3, 8, 13, 16, 19, 21, 23, 28, 30],
            ],
            [
                'name' => 'VAMOS STRIKE',
                'description' => null,
                'image' => null,
                'price' => 279900,
                'homepage_order' => 4,
                'products' => [4, 9, 13, 17, 19, 20, 23, 29, 30],
            ],
            [
                'name' => 'VAMOS FLOW',
                'description' => null,
                'image' => null,
                'price' => 349900,
                'homepage_order' => 5,
                'products' => [5, 10, 13, 17, 19, 21, 23, 29, 30],
            ],
            [
                'name' => 'VAMOS EDGE',
                'description' => null,
                'image' => null,
                'price' => 469900,
                'homepage_order' => 6,
                'products' => [5, 10, 14, 17, 19, 20, 24, 26, 29, 30],
            ],
        ];

        DB::transaction(function () use ($configurations): void {
            foreach ($configurations as $data) {
                $productIds = $data['products'];
                unset($data['products']);

                $configuration = Configuration::query()->updateOrCreate(
                ['name' => $data['name']],
                    $data,
                );

                $configuration->products()->sync($productIds);
            }
        });
    }
}
