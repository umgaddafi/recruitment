# Installation and Testing Guide

## Requirements

- PHP 8.2 or newer
- Composer
- Node.js and npm
- MySQL or MariaDB

This workspace includes `backend/composer.phar` because global Composer was not available.

## Environment

Copy `backend/.env.example` to `backend/.env` and configure MySQL:

```env
APP_NAME="University Staff Recruitment Portal"
APP_URL=http://127.0.0.1:8001
FRONTEND_URL=http://127.0.0.1:5173
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=recruitment
DB_USERNAME=root
DB_PASSWORD=
```

For XAMPP/LAMPP CLI usage:

```bash
cd backend
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan key:generate
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan migrate --seed
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan serve --host=127.0.0.1 --port=8001
```

In another terminal, start React:

```bash
cd frontend
npm install
npm run dev
```

## Default Test Users

- Super Admin: `superadmin@university.edu` / `password123`
- HR/Admin: `hr@university.edu` / `password123`
- Reviewer: `reviewer@university.edu` / `password123`
- Panel Member: `panel@university.edu` / `password123`
- Registrar: `registrar@university.edu` / `password123`
- Applicant: `applicant@example.com` / `password123`

## Testing

```bash
PATH=/opt/lampp/bin:$PATH /opt/lampp/bin/php artisan test
cd ../frontend
npm run build
```

The app can use SQLite for local smoke tests, but production/staging should use the MySQL settings above.
