<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentNotification extends Model
{
    protected $fillable = ['user_id', 'title', 'message', 'channel', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }
}
