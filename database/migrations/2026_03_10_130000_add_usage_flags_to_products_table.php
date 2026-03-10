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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('can_be_base_product')->default(false)->after('is_component');
            $table->boolean('is_sellable')->default(true)->after('can_be_base_product');
            $table->boolean('is_available_for_configuration')->default(false)->after('is_sellable');
        });

        DB::table('products')->update([
            'can_be_base_product' => false,
            'is_sellable' => true,
            'is_available_for_configuration' => DB::raw('is_component'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'can_be_base_product',
                'is_sellable',
                'is_available_for_configuration',
            ]);
        });
    }
};
