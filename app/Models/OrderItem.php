<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    protected $table = 'orderitems';

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function configuration(): HasMany
    {
        return $this->hasMany(Configuration::class);
    }
}
