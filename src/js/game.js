import { Dwarf } from "../models/dwarf.class.js";
import { Level } from "../levels/level.js";
import { GAME_CONFIG } from "./config.js";
import { drawDwarves, drawMap } from "./renderer.js";

let lastMoveTime = 0;
const {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  MOVE_INTERVAL,
  DWARF_COUNT,
} = GAME_CONFIG;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const level = new Level(MAP_WIDTH, MAP_HEIGHT);
canvas.width = level.width * TILE_SIZE;
canvas.height = level.height * TILE_SIZE;
const dwarves = Array.from({ length: DWARF_COUNT }, () =>
  generateDwarfOnGrass(level.tilemap)
);

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

// Funktion, um einen Zwerg auf einem "grass"-Tile zu generieren
function generateDwarfOnGrass(tilemap) {
  let x, y;
  do {
    x = Math.floor(Math.random() * tilemap[0].length); // Zufällige X-Koordinate
    y = Math.floor(Math.random() * tilemap.length); // Zufällige Y-Koordinate
  } while (tilemap[y][x] !== "grass"); // Wiederhole, bis ein "grass"-Tile gefunden wird

  return new Dwarf(x, y); // Erstelle einen Zwerg auf der gefundenen Position
}

// Spiel-Loop (Rendern)
function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(ctx, level, imageCache);

  if (timestamp - lastMoveTime > MOVE_INTERVAL) {
    dwarves.forEach((dwarf) => dwarf.move(level.tilemap));
    lastMoveTime = timestamp;
  }

  drawDwarves(ctx, dwarves, imageCache);
  requestAnimationFrame(gameLoop);
}

// Liste der Bilder, die vorgeladen werden müssen
const imagePaths = [
  "public/img/water.jpg",
  "public/img/grass.jpg",
  "public/img/mountain.jpg",
  "public/img/wood.jpg",
  "public/img/dwarf.jpg",
  "public/img/wood_home.jpg",
];

// Bilder vorladen und Spiel starten
preloadImages(imagePaths, () => requestAnimationFrame(gameLoop));
