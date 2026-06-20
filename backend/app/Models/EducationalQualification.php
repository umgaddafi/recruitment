<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationalQualification extends Model
{
    protected $fillable = [
        'user_id',
        'institution',
        'qualification',
        'field_of_study',
        'grade',
        'scale',
        'cgpa',
        'class_of_degree',
        'start_year',
        'end_year',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
