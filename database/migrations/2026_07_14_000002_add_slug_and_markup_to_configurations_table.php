<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->integer('markup_in_cents')->default(0)->after('price');
        });

        $configurations = DB::table('configurations')->get(['id', 'name', 'price']);

        foreach ($configurations as $configuration) {
            $componentsTotal = (int) DB::table('configuration_product')
                ->join('products', 'products.id', '=', 'configuration_product.product_id')
                ->where('configuration_product.configuration_id', $configuration->id)
                ->sum('products.price_in_cents');

            DB::table('configurations')
                ->where('id', $configuration->id)
                ->update([
                    'slug' => Str::slug($configuration->name).'-'.$configuration->id,
                    'markup_in_cents' => (int) $configuration->price - $componentsTotal,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            $table->dropColumn(['slug', 'markup_in_cents']);
        });
    }
};
