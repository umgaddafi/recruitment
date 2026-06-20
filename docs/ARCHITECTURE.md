# University Staff Recruitment Portal Architecture

## Stack

- Frontend: standalone React app in `frontend/` using React Router, Axios, lucide-react, Vite, and responsive CSS.
- Backend: Laravel 12 REST API in `backend/` using Sanctum token authentication, role middleware, request validation, and Eloquent models.
- Database: MySQL/MariaDB compatible schema with foreign keys, indexes, timestamps, and soft deletes where recruitment records must be preserved.

## Core Modules

- Landing and vacancy discovery: public pages list active published vacancies.
- Applicant workflow: registration, login, profile, qualifications, experience, certifications, application draft/submission, documents, status tracking, slip endpoint.
- Vacancy management: HR/Admin creates, publishes, closes, and deletes vacancies without removing applications.
- Review workflow: reviewers score applications and recommend or reject.
- Shortlisting: HR can manually shortlist or auto-generate by review score.
- Interview management: HR schedules interview batches, assigns applicants and panel members, and notifies applicants.
- Panel evaluation: panel members score interview candidates.
- Final approval: registrar approves or rejects recommended candidates.
- Administration: users, roles, departments, faculties, document types, settings, audit logs.
- Reports: dashboard aggregates and CSV exports for application lists.

## Role Model

- `super_admin`: full system administration.
- `hr_admin`: vacancy, shortlisting, interviews, reports.
- `reviewer`: application review.
- `panel_member`: interview scoring.
- `applicant`: application profile and submissions.
- `registrar`: final approval and reports.

## Database Schema Summary

- Access control: `users`, `roles`, `permissions`, `role_user`, `permission_role`, `personal_access_tokens`.
- Organization: `faculties`, `departments`, `units`.
- Recruitment setup: `vacancies`, `document_types`, `system_settings`.
- Applicant profile: `applicant_profiles`, `educational_qualifications`, `work_experiences`, `certifications`.
- Applications: `applications`, `application_documents`, `reviews`, `shortlists`.
- Interviews and approval: `interview_schedules`, `interview_applicant`, `interview_panel_members`, `interview_scores`, `final_approvals`.
- Governance: `recruitment_notifications`, `audit_logs`.

## Application Number Format

`UNI-REC-YEAR-RANDOMNUMBER`, for example `UNI-REC-2026-000123`.

The generation logic lives in `backend/app/Services/ApplicationNumberService.php`.
