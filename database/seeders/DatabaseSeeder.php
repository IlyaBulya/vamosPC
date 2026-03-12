<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class ,
            ProductSeeder::class ,
        ]);

        DB::table('users')->insert([
            'id' => 1,
            'name' => 'Nikita Tsekhomskiy',
            'email' => 'ntsekhomskiy@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$12$fQ5xW8m3LSablfk2v/qKCeEuQ8B.ZEfY6ecvauxG1LaHo4AX5U6fi',
            'is_admin' => true,
            'remember_token' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'id' => 2,
            'name' => 'Ilya Bulya',
            'email' => 'ilyade3004@gmail.com',
            'email_verified_at' => now(),
            'password' => '$2y$12$Yfw65GWrP7./Y/KKviH6OexRXd0R1i0LEDese2viYW9BuqUAGCJay',
            'is_admin' => true,
            'remember_token' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}