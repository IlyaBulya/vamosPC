<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserConfiguration extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'base_configuration_id',
        'name',
        'description',
        'image',
        'price',
        'status',
        'selected_components',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'base_configuration_id' => 'integer',
            'price' => 'integer',
            'selected_components' => 'array',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function baseConfiguration(): BelongsTo
    {
        return $this->belongsTo(Configuration::class, 'base_configuration_id');
    }
}

