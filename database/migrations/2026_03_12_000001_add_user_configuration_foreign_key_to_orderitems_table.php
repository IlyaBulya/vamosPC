<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orderitems', function (Blueprint $table) {
            $table->foreign('user_configuration_id')
                ->references('id')
                ->on('user_configurations')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orderitems', function (Blueprint $table) {
            $table->dropForeign(['user_configuration_id']);
        });
    }
};
