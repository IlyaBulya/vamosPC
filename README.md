# VamosPC

Laravel + Inertia + React storefront for a PC shop with:

- public catalog for hardware, accessories, laptops, and gaming PC builds
- configurable gaming PC flow with cart integration
- admin panel for products, categories, configurations, orders, users, and welcome-page build order

## Stack

- PHP 8.2+
- Laravel 12
- Inertia.js + React 19 + TypeScript
- Vite
- SQLite by default in `.env.example` (MySQL/PostgreSQL can be used if configured)

## Install

1. Install PHP and Node dependencies:

```bash
composer install
npm install
```

2. Create environment file and app key:

```bash
cp .env.example .env
php artisan key:generate
```

3. Create the local SQLite database if you use the default `.env.example` setup:

```bash
mkdir -p database
touch database/database.sqlite
```

If you use another database, update the `DB_*` variables in `.env` before continuing.

4. Run migrations and seeders:

```bash
php artisan migrate --seed
```

5. Create the public storage symlink for uploaded images:

```bash
php artisan storage:link
```

## Run locally

Recommended:

```bash
composer run dev
```

This starts:

- Laravel dev server
- queue listener
- log tailing
- Vite dev server

Minimal setup:

```bash
php artisan serve
npm run dev
```

## Seeded data

`php artisan migrate --seed` runs `DatabaseSeeder`, which adds:

- catalog categories
- products
- gaming PC configurations
- admin users defined in `database/seeders/DatabaseSeeder.php`

Review the seeded admin accounts before using the project outside local/dev environments.

## Useful commands

```bash
composer test
npm run build
npm run types
npm run format:check
```

## Storage note

Image uploads from the admin panel use Laravel's filesystem abstraction.

- local development can use the default local/public storage setup
- production environments such as Laravel Cloud can use S3-compatible object storage for uploaded media

The backing storage depends on the environment configuration. For S3/Laravel Cloud deployments, configure the relevant `AWS_*` variables and filesystem settings in the deployed environment.
