<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewScore extends Model
{
    protected $fillable = [
        'interview_schedule_id', 'application_id', 'panel_member_id',
        'technical_score', 'communication_score', 'leadership_score',
        'total_score', 'decision', 'remarks',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function panelMember(): BelongsTo
    {
        return $this->belongsTo(User::class, 'panel_member_id');
    }
}
