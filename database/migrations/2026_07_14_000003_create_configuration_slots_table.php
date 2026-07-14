<?php

use App\Models\Configuration;
use App\Support\ConfigurationSlots;
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
        Schema::create('configuration_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('configuration_id')->constrained()->cascadeOnDelete();
            $table->string('component_type')->nullable();
            $table->string('label');
            $table->unsignedInteger('quantity')->default(1);
            $table->foreignId('default_product_id')->constrained('products')->cascadeOnDelete();
            $table->boolean('is_required')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['configuration_id', 'sort_order']);
        });

        // Backfill: one slot per product currently attached via the
        // configuration_product pivot, mirroring the previously derived
        // slot behavior.
        Configuration::query()
            ->with(['products.category:id,name'])
            ->get()
            ->each(fn (Configuration $configuration) => ConfigurationSlots::rebuildFromProducts($configuration));
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_slots');
    }
};
