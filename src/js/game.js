import { Dwarf } from '../models/dwarf.class.js';
import { Level } from '../levels/level.js';

let lastMoveTime = 0; // Zeitstempel der letzten Bewegung
const MOVE_INTERVAL = 500; // Intervall in Millisekunden (0,5 Sekunden)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const level = new Level(100, 100);
const dwarf = new Dwarf(25, 25); // Setze den Zwerg in der Mitte der Map
const dwarves = [
    generateDwarfOnGrass(level.tilemap),
    generateDwarfOnGrass(level.tilemap)
];

// Größe der Tiles auf der Map
const TILE_SIZE = 12;

// Bild-Cache
const imageCache = {};

// Funktion zum Vorladen der Bilder
function preloadImages(imagePaths, callback) {
    let loadedImages = 0;
    const totalImages = imagePaths.length;

    imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
                callback(); // Starte das Spiel, wenn alle Bilder geladen sind
            }
        };
        imageCache[path] = img;
    });
}

// Funktion zum Zeichnen der Map
function drawMap(level) {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let tile = level.tilemap[y][x];
            const img = imageCache[`public/img/${tile}.jpg`];
            if (img) {
                ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// Funktion, um einen Zwerg auf einem "grass"-Tile zu generieren
function generateDwarfOnGrass(tilemap) {
    let x, y;
    do {
        x = Math.floor(Math.random() * tilemap[0].length); // Zufällige X-Koordinate
        y = Math.floor(Math.random() * tilemap.length);    // Zufällige Y-Koordinate
    } while (tilemap[y][x] !== 'grass'); // Wiederhole, bis ein "grass"-Tile gefunden wird

    return new Dwarf(x, y); // Erstelle einen Zwerg auf der gefundenen Position
}

// Funktion zum Zeichnen der Zwerge
function drawDwarves(dwarves) {
    dwarves.forEach((dwarf) => {
        const img = imageCache[dwarf.sprite];
        if (img) {
            ctx.drawImage(img, dwarf.x * TILE_SIZE, dwarf.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    });
}

// Spiel-Loop (Rendern)
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas löschen
    drawMap(level); // Map zeichnen

    // Bewegung des Zwergs nur alle 0,5 Sekunden
    if (timestamp - lastMoveTime > MOVE_INTERVAL) {
        dwarves.forEach((dwarf) => dwarf.move(level.tilemap)); // Bewege alle Zwerge
        lastMoveTime = timestamp; // Zeitstempel aktualisieren
    }

    drawDwarves(dwarves); // Zeichne alle Zwerge
    requestAnimationFrame(gameLoop); // Weiteres Frame anfordern
}

// Liste der Bilder, die vorgeladen werden müssen
const imagePaths = [
    'public/img/water.jpg',
    'public/img/grass.jpg',
    'public/img/mountain.jpg',
    'public/img/wood.jpg',
    'public/img/dwarf.jpg'
];

// Bilder vorladen und Spiel starten
preloadImages(imagePaths, () => requestAnimationFrame(gameLoop));