import { Level } from "../levels/level.js";
import { GAME_CONFIG } from "./config.js";
import { drawDwarves, drawMap } from "./renderer.js";
import { imageCache, preloadImages } from "./assetLoader.js";
import { createInitialDwarves } from "./spawnSystem.js";

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
const dwarves = createInitialDwarves(level.tilemap, DWARF_COUNT);

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
