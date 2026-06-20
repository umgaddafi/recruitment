<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    protected $fillable = [
        'application_number', 'user_id', 'vacancy_id', 'status', 'cover_letter',
        'submitted_at', 'locked_at', 'snapshot',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'locked_at' => 'datetime', 'snapshot' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function finalApproval(): HasOne
    {
        return $this->hasOne(FinalApproval::class);
    }

    public function staff(): HasOne
    {
        return $this->hasOne(Staff::class);
    }
}
