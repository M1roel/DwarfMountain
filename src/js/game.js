import { Application, Assets, Sprite } from 'pixi.js';
import { Level } from '../levels/level.js';
import { Dwarf } from '../models/dwarf.class.js';

const TILE_SIZE = 32; // Kachelgröße für einfachere Sichtbarkeit
const MOVE_INTERVAL = 100; // Bewegungsintervall in Millisekunden
let lastMoveTime = 0; // Zeitstempel der letzten Bewegung

// Erstelle eine PixiJS-Anwendung
const app = new Application();
document.body.appendChild(app.view);

// Erstelle das Level
const level = new Level(100, 100);
app.renderer.resize(level.width * TILE_SIZE, level.height * TILE_SIZE);

// Lade die Texturen
const textures = {
    'water': await Assets.load('public/img/water.jpg'),
    'grass': await Assets.load('public/img/grass.jpg'),
    'wood': await Assets.load('public/img/wood.jpg'),
    'mountain': await Assets.load('public/img/mountain.jpg'),
    'dwarf': await Assets.load('public/img/dwarf.jpg')
};

// Generiere Zwerge
const dwarves = [
    generateDwarfOnGrass(level.tilemap),
    generateDwarfOnGrass(level.tilemap)
];

// Funktion, um einen Zwerg auf einem "grass"-Tile zu generieren
function generateDwarfOnGrass(tilemap) {
    let x, y;
    do {
        x = Math.floor(Math.random() * tilemap[0].length); // Zufällige X-Koordinate
        y = Math.floor(Math.random() * tilemap.length);    // Zufällige Y-Koordinate
    } while (tilemap[y][x] !== 'grass'); // Wiederhole, bis ein "grass"-Tile gefunden wird

    return new Dwarf(x, y); // Erstelle einen Zwerg auf der gefundenen Position
}

// Map zeichnen
function drawMap() {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let tileType = level.tilemap[y][x];
            if (textures[tileType]) {
                let sprite = new Sprite(textures[tileType]);
                sprite.x = x * TILE_SIZE;
                sprite.y = y * TILE_SIZE;
                sprite.width = TILE_SIZE;
                sprite.height = TILE_SIZE;
                app.stage.addChild(sprite);
            }
        }
    }
}

// Zwerge zeichnen
function drawDwarves() {
    dwarves.forEach((dwarf) => {
        const img = textures['dwarf'];
        if (img) {
            const sprite = new Sprite(img);
            sprite.x = dwarf.x * TILE_SIZE;
            sprite.y = dwarf.y * TILE_SIZE;
            sprite.width = TILE_SIZE;
            sprite.height = TILE_SIZE;
            app.stage.addChild(sprite);
        }
    });
}

// Spiel-Loop (Animation)
function gameLoop(timestamp) {
    if (timestamp - lastMoveTime > MOVE_INTERVAL) {
        dwarves.forEach((dwarf) => dwarf.move(level.tilemap)); // Zwerge bewegen
        lastMoveTime = timestamp;
    }

    app.stage.removeChildren(); // Entferne alte Objekte
    drawMap(); // Zeichne die Karte
    drawDwarves(); // Zeichne die Zwerge
    requestAnimationFrame(gameLoop); // Nächsten Frame anfordern
}

// Starte das Spiel
requestAnimationFrame(gameLoop);
