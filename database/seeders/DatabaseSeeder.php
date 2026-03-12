<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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

        $admins = [
            [
                'name' => 'Nikita Tsekhomskiy',
                'email' => 'ntsekhomskiy@gmail.com',
                'password' => '$2y$12$fQ5xW8m3LSablfk2v/qKCeEuQ8B.ZEfY6ecvauxG1LaHo4AX5U6fi',
            ],
            [
                'name' => 'Ilya Bulya',
                'email' => 'ilyade3004@gmail.com',
                'password' => '$2y$12$Yfw65GWrP7./Y/KKviH6OexRXd0R1i0LEDese2viYW9BuqUAGCJay',
            ],
        ];

        foreach ($admins as $adminData) {
            $admin = User::query()->firstOrNew([
                'email' => $adminData['email'],
            ]);

            $admin->forceFill([
                'name' => $adminData['name'],
                'email_verified_at' => $admin->email_verified_at ?? now(),
                'is_admin' => true,
            ]);

            if (! $admin->exists) {
                $admin->password = $adminData['password'];
            }

            $admin->save();
        }
    }
}
