import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

export default function Library({ auth, userBooks = [] }) {
    const { flash } = usePage().props;
    const searchBooks = flash?.searchBooks || [];

    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.post('/library/search', { query });
    };

    const handleAdd = (book) => {
        // Sendet die API-Daten an deine Laravel add() Methode
        router.post('/library/add', {
            olid: book.key, // Die OpenLibrary ID[cite: 4]
            title: book.title,
            author: book.author_name ? book.author_name[0] : 'Unbekannt', // API liefert oft ein Array[cite: 4]
            cover_url: book.cover_url,
            status: 'owned', // Standardmäßig auf 'owned' gesetzt
        });
    };

    return (
        <>
            <Head title="My Pixel Library - Data Test" />

            {/* Hintergrund "Night" (#1B2529) aus dem Color Guide[cite: 3] */}
            <div className="min-h-screen bg-[#1B2529] p-8 font-sans text-[#412E2E]">

                {/* Haupt-UI-Fenster im "Main Paper" Ton (#FAEFE9)[cite: 3] */}
                <div className="max-w-4xl mx-auto bg-[#FAEFE9] rounded-xl shadow-lg p-6 border-4 border-[#412E2E]">
                    <h1 className="text-3xl font-bold mb-6">Willkommen, {auth.user.name}</h1>

                    {/* BEREICH 1: Meine Bücher */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold border-b-2 border-[#966052] pb-2 mb-4">Meine Bibliothek</h2>
                        {userBooks.length === 0 ? (
                            <p className="text-[#665349]">Dein Regal ist noch leer.</p> // "Soft Text" Farbe[cite: 3]
                        ) : (
                            <ul className="grid grid-cols-2 gap-4">
                                {userBooks.map((book) => (
                                    <li key={book.olid} className="bg-[#FDF8F2] p-4 rounded border-2 border-[#805945] flex gap-4">
                                        {/* Cover anzeigen, falls vorhanden */}
                                        {book.cover_url && (
                                            <img src={book.cover_url} alt="Cover" className="w-16 h-24 object-cover" />
                                        )}
                                        <div>
                                            <strong className="block">{book.title}</strong>
                                            <span className="text-sm text-[#82766B]">{book.author}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* BEREICH 2: Buch suchen */}
                    <div>
                        <h2 className="text-xl font-bold border-b-2 border-[#966052] pb-2 mb-4">Neues Buch suchen</h2>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Titel oder Autor eingeben..."
                                className="flex-1 p-2 rounded border-2 border-[#412E2E] bg-[#FDF8F2]" // "Ivory" Hintergrund[cite: 3]
                                required
                            />
                            <button
                                type="submit"
                                className="bg-[#966052] text-[#FDF8F2] px-4 py-2 rounded font-bold hover:bg-[#805945]" // "Wood" Button[cite: 3]
                            >
                                Suchen
                            </button>
                        </form>

                        {/* Suchergebnisse */}
                        {searchBooks.length > 0 && (
                            <ul className="space-y-3">
                                {searchBooks.map((book) => (
                                    <li key={book.key} className="flex justify-between items-center bg-[#FDF8F2] p-3 rounded border border-[#C58968]">
                                        {book.cover_url && (
                                            <img
                                                src={book.cover_url}
                                                alt={`Cover von ${book.title}`}
                                                className="w-12 h-18 object-cover mr-3"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <strong>{book.title}</strong>
                                            <span className="text-sm ml-2 text-[#82766B]">
                                                ({book.author_name ? book.author_name.join(', ') : 'Unbekannter Autor'})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleAdd(book)}
                                            className="bg-[#E69F9D] text-[#412E2E] px-3 py-1 rounded font-bold hover:bg-[#F2B6A9]" // "Pink" Accent[cite: 3]
                                        >
                                            + Hinzufügen
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}