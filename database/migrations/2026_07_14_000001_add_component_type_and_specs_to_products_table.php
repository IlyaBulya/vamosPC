<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Legacy category slug => component type value.
     *
     * @var array<string, string>
     */
    private const CATEGORY_MAP = [
        'graphics-card' => 'gpu',
        'processor' => 'cpu',
        'motherboard' => 'motherboard',
        'cooling' => 'cooler',
        'memory' => 'ram',
        'ssd' => 'storage',
        'hdd' => 'storage',
        'power-supply' => 'psu',
        'case' => 'case',
        'additional-cooling' => 'case_fan',
        'thermal-paste' => 'thermal_paste',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('component_type')->nullable()->after('category_id')->index();
            $table->json('specs')->nullable()->after('color');
        });

        foreach (self::CATEGORY_MAP as $categoryName => $componentType) {
            DB::table('products')
                ->whereIn('category_id', fn ($query) => $query
                    ->select('id')
                    ->from('categories')
                    ->where('name', $categoryName))
                ->update(['component_type' => $componentType]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['component_type', 'specs']);
        });
    }
};
