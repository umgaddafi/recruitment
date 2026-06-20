<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterviewSchedule extends Model
{
    protected $fillable = [
        'vacancy_id', 'title', 'batch_name', 'interview_date', 'interview_time',
        'venue', 'mode', 'meeting_link',
    ];

    protected function casts(): array
    {
        return ['interview_date' => 'date'];
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function applications(): BelongsToMany
    {
        return $this->belongsToMany(Application::class, 'interview_applicant')->withPivot('notified_at');
    }

    public function panelMembers(): HasMany
    {
        return $this->hasMany(InterviewPanelMember::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(InterviewScore::class);
    }
}
