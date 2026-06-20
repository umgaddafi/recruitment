<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InterviewScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['panel_member', 'super_admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'interview_schedule_id' => ['required', 'exists:interview_schedules,id'],
            'application_id' => ['required', 'exists:applications,id'],
            'technical_score' => ['required', 'integer', 'between:0,40'],
            'communication_score' => ['required', 'integer', 'between:0,30'],
            'leadership_score' => ['required', 'integer', 'between:0,30'],
            'decision' => ['required', 'in:pending,recommended,rejected'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
