# Pixel Library

Pixel Library is a Laravel 13 application with an Inertia.js and React frontend. The library experience is currently implemented as a KAPLAY pixel-art scene in `resources/js/Pages/Library.jsx`.

## Requirements

Install these tools before setting up the project:

- PHP 8.3 or newer
- Composer
- Node.js and npm
- Git
- SQLite and the PHP SQLite extensions

Verify the main tools with:

```bash
php -v
composer -V
node --version
npm --version
```

### PHP SQLite extension

Laravel uses SQLite by default. PHP must have both `pdo_sqlite` and `sqlite3` enabled. Check with:

```bash
php -m | grep -Ei 'pdo|sqlite'
```

On Arch Linux, install the PHP package if needed and enable the extensions in `/etc/php/php.ini` by uncommenting:

```ini
extension=pdo_sqlite
extension=sqlite3
```

On Debian or Ubuntu, install the matching package for your PHP version, for example:

```bash
sudo apt install php8.3-sqlite3
```

After changing PHP configuration, open a new terminal and run the check again. If `pdo_sqlite` is missing, Laravel will fail with `could not find driver` when it starts a session.

## Setup after cloning

Run these commands from the project directory:

```bash
git clone <repository-url>
cd pixel-library

composer install
npm install

cp .env.example .env
php artisan key:generate

touch database/database.sqlite
php artisan migrate

npm run build
```

The `database/database.sqlite` file is local development data and should not be committed. The migrations create users, sessions, cache, and queue tables.

## Run locally

Use two terminals from the project directory.

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser. Vite provides hot module replacement while `npm run dev` is running.

Useful URLs:

- `/` - welcome page
- `/login` - login page
- `/register` - registration page
- `/dashboard` - authenticated dashboard
- `/library` - authenticated pixel library
- `/profile` - authenticated user profile

The dashboard, library, and profile routes require a logged-in and verified user. Create an account at `/register` before opening `/library`.

## Where to edit the project

### Pages and frontend behavior

- `resources/js/Pages/` contains Inertia pages. Edit `resources/js/Pages/Library.jsx` for the library scene.
- `resources/js/Components/` contains reusable React components.
- `resources/js/Layouts/` contains shared page layouts.
- `resources/js/app.jsx` is the Inertia application entry point and discovers pages.
- `resources/css/app.css` contains the main stylesheet.

When adding a page, create a `.jsx` file under `resources/js/Pages/` and render it from a Laravel route with `Inertia::render('PageName')`.

### Routes and backend

- `routes/web.php` contains browser routes and connects URLs to Inertia pages or controllers.
- `routes/auth.php` contains authentication routes.
- `app/Http/Controllers/` contains request-handling controllers.
- `app/Http/Requests/` contains validation request classes.
- `app/Models/` contains Eloquent models.
- `database/migrations/` contains database schema changes.
- `database/factories/` and `database/seeders/` contain test and development data setup.

After changing a migration, run:

```bash
php artisan migrate
```

To rebuild the local database from scratch, this deletes all local SQLite data:

```bash
php artisan migrate:fresh
```

### Configuration

- `.env` contains local settings and must not be committed.
- `.env.example` documents the expected environment variables.
- `config/` contains Laravel configuration files.
- `vite.config.js` configures the frontend build.
- `tailwind.config.js` and `postcss.config.js` configure the CSS toolchain.

## Tests and production build

Run the PHP test suite with:

```bash
php artisan test
```

Build the frontend bundle with:

```bash
npm run build
```

Before opening a pull request, run both commands and check that the application loads at `/` and `/library`.

## Common fixes

Clear cached Laravel configuration after changing `.env`:

```bash
php artisan optimize:clear
```

If Vite reports that an import cannot be resolved, check that the referenced file exists under `resources/js/` and restart `npm run dev`.

If Laravel reports `could not find driver`, enable `pdo_sqlite` as described above. Confirm the active PHP binary sees it with:

```bash
php -r 'var_export(PDO::getAvailableDrivers()); echo PHP_EOL;'
```

The output must include `sqlite`.

## Contributing

Create a feature branch, keep changes focused, run the tests and frontend build, and open a pull request with a short description of the behavior you changed.
