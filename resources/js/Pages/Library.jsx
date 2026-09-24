import { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import kaplay from 'kaplay';

export default function Library({ auth, userBooks }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        // KAPLAY im lokalen Modus an das Canvas binden
        const k = kaplay({
            canvas: canvasRef.current,
            global: false, // Wichtig: Hält das globale Window-Objekt sauber
            crisp: true,   // Perfekt für scharfe Pixel-Art
            background: [27, 37, 41], // "Night" (#1B2529) aus deinem Color Guide
        });

        // Basis-Szene laden
        k.scene("main", () => {
            // Mehrere Regale aus deinem "Wood" Palette-Bereich (#966052 Base)[cite: 3]
            [[200, 150], [320, 150], [440, 150]].forEach(([x, y]) => {
                k.add([
                    k.rect(64, 128),
                    k.pos(x, y),
                    k.color(150, 96, 82), // RGB für Wood[cite: 3]
                    k.area(),
                    k.body({ isStatic: true }),
                    "bookshelf" // Tag für Kollisionen
                ]);
            });

            // Der Spieler (Platzhalter)
            const player = k.add([
                k.rect(32, 32),
                k.pos(100, 200),
                k.color(230, 159, 157), // RGB für Pink (#E69F9D) als Interaktions-Farbe[cite: 3]
                k.area(),
                k.body(),
            ]);

            // Simples 2D Movement
            k.onKeyDown("right", () => player.move(160, 0));
            k.onKeyDown("left", () => player.move(-160, 0));
            k.onKeyDown("up", () => player.move(0, -160));
            k.onKeyDown("down", () => player.move(0, 160));

            // Kollision / Interaktion (Die Brücke zu React)[cite: 2]
            player.onCollide("bookshelf", () => {
                k.debug.paused = true; // Spiel pausieren[cite: 2]
                console.log("Regal berührt! Hier poppt gleich das UI auf.");
                // Hier steuern wir später den React-State für das "Main Paper" (#FAEFE9) Overlay[cite: 3]
            });
        });

        k.go("main");

        // Cleanup beim Verlassen der Seite via Inertia
        return () => k.quit();
    }, []);

    return (
        <>
            <Head title="My Pixel Library" />
            {/* Hintergrund der Seite nutzt "Ink" aus dem Color Guide[cite: 3] */}
            <div className="flex justify-center items-center h-screen bg-[#14181E]">
                <canvas
                    ref={canvasRef}
                    width="800"
                    height="600"
                    style={{ border: '4px solid #1B2529' }}
                />
            </div>
        </>
    );
}