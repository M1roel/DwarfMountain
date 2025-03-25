import { Dwarf } from '../models/dwarf.class.js';
import { Level } from '..levels/level.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const level = new Level(50, 50);
const dwarf = new Dwarf(25, 25);  // Setze den Zwerg in der Mitte der Map

console.log(dwarf);
console.log(level.tilemap);  // Prüfe die generierte Map

// Größe der Tiles auf der Map
const TILE_SIZE = 32;

// Funktion zum Zeichnen der Map
function drawMap(level) {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let tile = level.tilemap[y][x];
            let img = new Image();
            img.src = `assets/${tile}.png`;  // Lade die entsprechenden Tiles (water, grass, mountain)
            img.onload = () => {
                ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            };
        }
    }
}

// Funktion zum Zeichnen des Spielers
function drawPlayer(dwarf) {
    const img = new Image();
    img.src = dwarf.sprite;  // Lade den Zwerg
    img.onload = () => {
        ctx.drawImage(img, dwarf.x * TILE_SIZE, dwarf.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
}

// Spiel-Loop (Rendern)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Canvas löschen
    drawMap(level);  // Map zeichnen
    dwarf.move();  // Zwerg bewegen
    drawPlayer(dwarf);  // Spieler zeichnen
    requestAnimationFrame(gameLoop);  // Weiteres Frame anfordern
}

gameLoop();  // Starte den Spiel-Loop
