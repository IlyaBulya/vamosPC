<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Configuration extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'price',
        'markup_in_cents',
        'homepage_order',
        'display_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'markup_in_cents' => 'integer',
            'homepage_order' => 'integer',
            'display_order' => 'integer',
        ];
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'configuration_product')
            ->withTimestamps();
    }

    public function slots(): HasMany
    {
        return $this->hasMany(ConfigurationSlot::class)->orderBy('sort_order');
    }

    public function userConfigurations(): HasMany
    {
        return $this->hasMany(UserConfiguration::class, 'base_configuration_id');
    }
}
