<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(['super_admin', 'hr_admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'college_id' => ['nullable', 'exists:colleges,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'employment_type' => ['required', 'string', 'max:100'],
            'staff_category' => ['required', 'in:Academic,Non-Academic'],
            'rank_or_grade' => ['nullable', 'string', 'max:150'],
            'vacant_positions' => ['required', 'integer', 'min:1', 'max:1000'],
            'minimum_qualification' => ['required', 'string', 'max:255'],
            'required_documents' => ['nullable', 'array'],
            'required_documents.*' => ['string', 'max:120'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:255'],
            'job_description' => ['required', 'string'],
            'eligibility_criteria' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'deadline' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'in:draft,published,closed,unpublished'],
        ];
    }
}
