<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('applicant') ?? false;
    }

    public function rules(): array
    {
        return [
            'vacancy_id' => ['required', 'exists:vacancies,id'],
            'cover_letter' => ['nullable', 'string'],
            'submit' => ['nullable', 'boolean'],
            'wizard_step' => ['nullable', 'integer', 'between:0,7'],
            'declaration_accepted' => ['nullable', 'boolean'],
            'g_recaptcha_response' => ['nullable', 'string'],
        ];
    }
}
