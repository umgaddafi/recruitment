<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use SoftDeletes;

    protected $fillable = ['department_id', 'name', 'code'];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
