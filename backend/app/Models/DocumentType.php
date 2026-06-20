<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = ['name', 'slug', 'is_required_by_default', 'allowed_mimes', 'max_size_kb'];

    protected function casts(): array
    {
        return ['is_required_by_default' => 'boolean'];
    }
}
