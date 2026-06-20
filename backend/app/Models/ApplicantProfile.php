<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantProfile extends Model
{
    protected $fillable = [
        'user_id', 'application_number', 'first_name', 'middle_name', 'last_name',
        'gender', 'date_of_birth', 'nationality', 'state_of_origin', 'local_government',
        'address', 'city', 'passport_path',
        'application_wizard_step', 'application_wizard_payload',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'application_wizard_step' => 'integer',
            'application_wizard_payload' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
