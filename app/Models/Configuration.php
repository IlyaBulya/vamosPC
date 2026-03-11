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
        'description',
        'image',
        'price',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
        ];
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'configuration_product')
            ->withTimestamps();
    }

    public function userConfigurations(): HasMany
    {
        return $this->hasMany(UserConfiguration::class, 'base_configuration_id');
    }
}
