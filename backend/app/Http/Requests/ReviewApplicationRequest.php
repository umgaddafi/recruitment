<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['reviewer', 'super_admin', 'hr_admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'qualification_score' => ['required', 'integer', 'between:0,25'],
            'experience_score' => ['required', 'integer', 'between:0,25'],
            'publication_score' => ['required', 'integer', 'between:0,25'],
            'fit_score' => ['required', 'integer', 'between:0,25'],
            'decision' => ['required', 'in:pending,recommended,rejected'],
            'comments' => ['nullable', 'string'],
        ];
    }
}
