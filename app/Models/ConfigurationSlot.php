<?php

namespace App\Models;

use App\Enums\ComponentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfigurationSlot extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'configuration_id',
        'component_type',
        'label',
        'quantity',
        'default_product_id',
        'is_required',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'configuration_id' => 'integer',
            'component_type' => ComponentType::class,
            'quantity' => 'integer',
            'default_product_id' => 'integer',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function configuration(): BelongsTo
    {
        return $this->belongsTo(Configuration::class);
    }

    public function defaultProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'default_product_id');
    }
}
