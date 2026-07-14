<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fill structured specs for the seeded catalog on databases that were
     * populated before specs existed. Matches by exact description and
     * never overwrites specs that are already set.
     */
    public function up(): void
    {
        $specsByDescription = require database_path('data/component-specs.php');

        foreach ($specsByDescription as $description => $specs) {
            DB::table('products')
                ->where('description', $description)
                ->whereNull('specs')
                ->update(['specs' => json_encode($specs)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data backfill; nothing to restore.
    }
};
