# JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE Recruitment Portal

This project is split into two top-level apps:

- `backend/`: Laravel 12 REST API with Sanctum authentic ation.
- `frontend/`: React/Vite single-page app.

## Quick Start

Start the backend API:

```bash
cd backend
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php ./composer.phar install
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan migrate --seed
# Prefer Apache/XAMPP on port 80 for LAN access
# PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan serve --host=0.0.0.0 --port=80
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the machine's LAN address in your browser, for example `http://192.168.1.10:5173` while developing or `http://192.168.1.10/` when served by XAMPP Apache.

## Test Users

- Super Admin: `superadmin@uam.edu.ng` / `password123`
- HR/Admin: `hr@uam.edu.ng` / `password123`
- Reviewer: `reviewer@uam.edu.ng` / `password123`
- Panel Member: `panel@uam.edu.ng` / `password123`
- Registrar: `registrar@uam.edu.ng` / `password123`
- Applicant: `applicant@gmail.com` / `password123`

## Documentation
- Architecture and database schema: `docs/ARCHITECTURE.md`
- API endpoints: `docs/API.md`
- Installation and testing: `docs/INSTALLATION.md`
