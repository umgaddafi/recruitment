<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OLevelResult extends Model
{
    protected $fillable = ['user_id', 'school_name', 'exam_number', 'exam_year', 'exam_type', 'subjects'];

    protected function casts(): array
    {
        return [
            'exam_year' => 'integer',
            'subjects' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
