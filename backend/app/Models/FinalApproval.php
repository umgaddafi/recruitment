<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinalApproval extends Model
{
    protected $fillable = ['application_id', 'approved_by', 'decision', 'reason', 'decided_at'];

    protected function casts(): array
    {
        return ['decided_at' => 'datetime'];
    }
}
