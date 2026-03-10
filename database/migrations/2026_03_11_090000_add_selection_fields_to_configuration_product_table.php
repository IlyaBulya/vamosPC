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
        Schema::table('configuration_product', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('product_id');
            $table->unsignedInteger('qty')->default(1)->after('category_id');
            $table->unsignedInteger('position')->default(0)->after('qty');
            $table->index(['configuration_id', 'category_id']);
            $table->index(['configuration_id', 'position']);
        });

        DB::statement(
            'UPDATE configuration_product
             SET category_id = (
                SELECT category_id
                FROM products
                WHERE products.id = configuration_product.product_id
             )
             WHERE category_id IS NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuration_product', function (Blueprint $table) {
            $table->dropIndex(['configuration_id', 'category_id']);
            $table->dropIndex(['configuration_id', 'position']);
            $table->dropColumn(['category_id', 'qty', 'position']);
        });
    }
};
