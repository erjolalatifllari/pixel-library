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

## Using the backend from React

This project uses Inertia.js instead of a separate JSON API. Laravel renders an
Inertia page and sends backend data as props. React receives those props in the
page component, and `useForm` or `router` from `@inertiajs/react` sends requests
back to Laravel.

### Send database records to a page

Load records in a controller and pass them to `Inertia::render`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LibraryController extends Controller
{
	public function index()
	{
		$books = Auth::user()->books()->get();

		return Inertia::render('Library', [
			'userBooks' => $books,
		]);
	}
}
```

Register the controller method in `routes/web.php`:

```php
use App\Http\Controllers\LibraryController;

Route::get('/library', [LibraryController::class, 'index'])
	->middleware(['auth', 'verified'])
	->name('library');
```

Read the prop in the React page. Eloquent models are serialized by Inertia into
normal JavaScript objects:

```jsx
import { Head } from '@inertiajs/react';

export default function Library({ userBooks = [] }) {
	return (
		<>
			<Head title="My Pixel Library" />

			<ul>
				{userBooks.map((book) => (
					<li key={book.olid}>
						{book.title} by {book.author || 'Unknown author'}
					</li>
				))}
			</ul>
		</>
	);
}
```

### Create and update data from React

Use `useForm` for forms that submit to Laravel. The form data keys must match
the validation rules in the controller:

```jsx
import { useForm } from '@inertiajs/react';

export default function AddBookForm() {
	const { data, setData, post, processing, errors, reset } = useForm({
		olid: '',
		title: '',
		author: '',
		status: 'owned',
	});

	function submit(event) {
		event.preventDefault();

		post(route('library.add'), {
			onSuccess: () => reset(),
		});
	}

	return (
		<form onSubmit={submit}>
			<input
				value={data.olid}
				onChange={(event) => setData('olid', event.target.value)}
				placeholder="OL123M"
			/>
			<input
				value={data.title}
				onChange={(event) => setData('title', event.target.value)}
				placeholder="Book title"
			/>
			<input
				value={data.author}
				onChange={(event) => setData('author', event.target.value)}
				placeholder="Author"
			/>
			<select
				value={data.status}
				onChange={(event) => setData('status', event.target.value)}
			>
				<option value="owned">Owned</option>
				<option value="wishlist">Wishlist</option>
			</select>

			{errors.book && <p>{errors.book}</p>}
			<button type="submit" disabled={processing}>
				Add book
			</button>
		</form>
	);
}
```

The matching backend route is:

```php
Route::post('/library/add', [LibraryController::class, 'add'])
	->middleware(['auth', 'verified'])
	->name('library.add');
```

For a request without a visible form, use `router.post`:

```jsx
import { router } from '@inertiajs/react';

router.post(route('library.add'), {
	olid: 'OL123M',
	title: 'A book',
	author: 'An author',
	status: 'wishlist',
});
```

Inertia automatically includes the CSRF token from the Laravel page and follows
Laravel redirects. Validation errors are available through `errors` in
`useForm`. Use `onSuccess`, `onError`, and `onFinish` for loading and UI state.

### Search external data through Laravel

The library search is kept on the backend so the Open Library request and any
future API keys remain off the client. Submit the search query to Laravel:

```jsx
const { data, setData, post, processing, errors } = useForm({ query: '' });

function search(event) {
	event.preventDefault();
	post(route('library.search'), { preserveState: true });
}
```

The backend validates `query`, calls Open Library, and redirects back with a
`searchBooks` flash value:

```php
Route::post('/library/search', [LibraryController::class, 'search'])
	->middleware(['auth', 'verified'])
	->name('library.search');
```

To consume flash data in React, expose it from the shared Inertia props in
`app/Http/Middleware/HandleInertiaRequests.php`:

```php
public function share(Request $request): array
{
	return [
		...parent::share($request),
		'flash' => [
			'searchBooks' => fn () => $request->session()->get('searchBooks'),
		],
	];
}
```

Then read it with `usePage`:

```jsx
import { usePage } from '@inertiajs/react';

const { flash } = usePage().props;
const searchBooks = flash?.searchBooks ?? [];
```

### Database relationships

The application stores reusable book data in `books` and connects users to
books through `user_books`. A user can access their books with the relationship
already defined in `app/Models/User.php`:

```php
$books = $user->books()->get();
$books = $user->books()->wherePivot('status', 'wishlist')->get();
```

The `Book` model uses the Open Library ID (`olid`) as its primary key, so React
lists should use `book.olid` as the key. Add new columns with a migration, run
`php artisan migrate`, and update the model's `$fillable` list before accepting
the new value from a request.

### Current backend prerequisites

Before using the examples on a clean clone, confirm these project files are
present and named exactly as shown:

- `app/Http/Controllers/LibraryController.php` must contain the
  `LibraryController` class imported by `routes/web.php`.
- `database/migrations/2026_09_25_120454_create_user_books_table.php` must define
  the `olid` column before creating the foreign key to `books.olid`.

Check the backend before starting the frontend:

```bash
composer dump-autoload
php artisan optimize:clear
php artisan migrate:fresh
php artisan route:list --path=library
```

The route list should show `GET /library`, `POST /library/search`, and
`POST /library/add`.

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
