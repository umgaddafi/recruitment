<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $fillable = ['college_id', 'name', 'code', 'type'];

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
