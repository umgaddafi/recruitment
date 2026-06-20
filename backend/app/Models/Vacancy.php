<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vacancy extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'faculty_id', 'department_id', 'unit_id', 'employment_type',
        'staff_category', 'rank_or_grade', 'vacant_positions', 'minimum_qualification', 'required_documents',
        'requirements',
        'job_description', 'eligibility_criteria', 'start_date', 'deadline', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'required_documents' => 'array',
            'requirements' => 'array',
            'start_date' => 'date',
            'deadline' => 'date',
        ];
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
