# API Documentation

Backend base URL: `http://127.0.0.1:8001/api`

When running the frontend dev server, `frontend/vite.config.js` proxies `/api` to the backend.

Use `Authorization: Bearer <token>` for protected routes. Tokens are issued by Laravel Sanctum.

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/verify-email/{id}/{hash}`
- `POST /auth/email/verification-notification`
- `GET /auth/me`
- `POST /auth/logout`

## Public

- `GET /lookups`
- `GET /vacancies`
- `GET /vacancies/{vacancy}`

## Applicant

- `GET /profile`
- `PUT /profile`
- `GET /applications`
- `POST /applications`
- `GET /applications/{application}`
- `PUT /applications/{application}`
- `POST /applications/{application}/documents`
- `GET /applications/{application}/slip`
- `GET /documents/{document}`

## HR/Admin

- `POST /admin/vacancies`
- `PUT /admin/vacancies/{vacancy}`
- `DELETE /admin/vacancies/{vacancy}`
- `POST /admin/vacancies/{vacancy}/close`
- `GET /shortlists`
- `POST /shortlists`
- `POST /shortlists/auto`
- `GET /interviews`
- `POST /interviews`

## Reviewer

- `GET /reviews`
- `POST /applications/{application}/reviews`

## Panel Member

- `GET /panel/interviews`
- `POST /panel/interview-scores`

## Registrar

- `GET /final-approvals`
- `POST /final-approvals/{application}`

## Reports

- `GET /dashboard`
- `GET /reports`
- `GET /reports/export/{type}`

Valid export types include `all`, `shortlisted`, `approved`, and `rejected`.

## Super Admin

- `GET /admin/users`
- `POST /admin/users`
- `PUT /admin/users/{user}`
- `GET /admin/organization`
- `POST /admin/faculties`
- `POST /admin/departments`
- `GET|POST /admin/document-types`
- `GET|POST /admin/settings`
- `GET /admin/audit-logs`
