<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'type',
        'description',
        'image',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
