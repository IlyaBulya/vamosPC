<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            $table->unsignedInteger('homepage_order')->nullable()->after('price');
        });

        $configurationIds = DB::table('configurations')
            ->orderBy('id')
            ->pluck('id');

        foreach ($configurationIds as $index => $configurationId) {
            DB::table('configurations')
                ->where('id', $configurationId)
                ->update([
                    'homepage_order' => $index + 1,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            $table->dropColumn('homepage_order');
        });
    }
};
