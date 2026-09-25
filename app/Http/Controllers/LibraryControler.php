<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Models\Book;

class LibraryController extends Controller
{
    public function index()
    {
        // Lädt alle Bücher des Users inklusive des Status aus der Pivot-Tabelle
        $userBooks = Auth::user()->books()->get();

        return Inertia::render('Library', [
            'userBooks' => $userBooks,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        $response = Http::get("https://openlibrary.org/search.json", [
            'q' => $request->input('query'),
            'fields' => 'key,title,author_name',
            'limit' => 10,
        ]);

        $results = $response->successful() ? $response->json('docs') : [];

        return back()->with('searchBooks', $results);
    }

    public function add(Request $request)
    {
        $request->validate([
            'olid' => 'required|string',
            'title' => 'required|string',
            'author' => 'nullable|string',
            'status' => 'required|in:owned,wishlist',
        ]);

        $user = Auth::user();
        
        $olid = str_replace('/works/', '', $request->input('olid'));

        if ($user->books()->where('user_books.olid', $olid)->exists()) {
            return back()->withErrors(['book' => 'Dieses Buch steht bereits in deinem Regal.']);
        }

        $book = Book::find($olid);

        if (!$book) {
            $book = Book::create([
                'olid' => $olid,
                'title' => $request->input('title'),
                'author' => $request->input('author'),
                'cover_url' => "https://covers.openlibrary.org/b/olid/{$olid}-M.jpg",
            ]);
        }

        $user->books()->attach($olid, ['status' => $request->input('status')]);

        return back();
    }
}