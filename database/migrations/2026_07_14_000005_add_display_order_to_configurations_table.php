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
            $table->unsignedInteger('display_order')->nullable()->after('homepage_order');
        });

        // Preserve the current storefront arrangement (newest first).
        $ids = DB::table('configurations')->orderByDesc('id')->pluck('id');

        foreach ($ids as $index => $id) {
            DB::table('configurations')
                ->where('id', $id)
                ->update(['display_order' => $index + 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configurations', function (Blueprint $table) {
            $table->dropColumn('display_order');
        });
    }
};
