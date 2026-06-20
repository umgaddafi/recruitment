<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    protected $table = 'staff';

    protected $fillable = [
        'application_id',
        'user_id',
        'first_name',
        'surname',
        'other_name',
        'pf_number',
        'phone',
        'email',
        'department',
        'rank',
        'appointed_at',
    ];

    protected function casts(): array
    {
        return ['appointed_at' => 'datetime'];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
