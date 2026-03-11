<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('categories')
            ->where('name', 'gaming-pc')
            ->exists();

        if ($exists) {
            return;
        }

        DB::table('categories')->insert([
            'name' => 'gaming-pc',
            'type' => 'gaming-pc',
            'description' => 'Ready-made gaming desktop builds.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('categories')
            ->where('name', 'gaming-pc')
            ->where('type', 'gaming-pc')
            ->delete();
    }
};
