import { Level } from "../levels/level.js";
import { GAME_CONFIG } from "./config.js";
import { drawDwarves, drawMap } from "./renderer.js";
import { imageCache, preloadImages } from "./assetLoader.js";
import { createInitialDwarves } from "./spawnSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { createWorldState } from "./worldState.js";

const {
  TILE_SIZE,
  MAP_WIDTH: DEFAULT_MAP_WIDTH,
  MAP_HEIGHT: DEFAULT_MAP_HEIGHT,
  MOVE_INTERVAL: DEFAULT_MOVE_INTERVAL,
  DWARF_COUNT: DEFAULT_DWARF_COUNT,
  INVENTORY_LIMIT: DEFAULT_INVENTORY_LIMIT,
} = GAME_CONFIG;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const settingsForm = document.getElementById("settingsForm");
const resetDefaultsButton = document.getElementById("resetDefaults");
const settings = {
  mapWidth: document.getElementById("mapWidth"),
  mapHeight: document.getElementById("mapHeight"),
  dwarfCount: document.getElementById("dwarfCount"),
  moveInterval: document.getElementById("moveInterval"),
  inventoryLimit: document.getElementById("inventoryLimit"),
};
const settingOutputs = {
  mapWidth: document.getElementById("mapWidthValue"),
  mapHeight: document.getElementById("mapHeightValue"),
  dwarfCount: document.getElementById("dwarfCountValue"),
  moveInterval: document.getElementById("moveIntervalValue"),
  inventoryLimit: document.getElementById("inventoryLimitValue"),
};
const summaryElements = {
  dimensions: document.getElementById("summaryDimensions"),
  tiles: document.getElementById("summaryTiles"),
  dwarves: document.getElementById("summaryDwarves"),
  scale: document.getElementById("summaryScale"),
};

const defaults = {
  mapWidth: DEFAULT_MAP_WIDTH,
  mapHeight: DEFAULT_MAP_HEIGHT,
  dwarfCount: DEFAULT_DWARF_COUNT,
  moveInterval: DEFAULT_MOVE_INTERVAL,
  inventoryLimit: DEFAULT_INVENTORY_LIMIT,
};

function updateOutput(name) {
  settingOutputs[name].textContent = settings[name].value;
}

function getSettlementScale(tileCount, dwarfCount) {
  const intensity = tileCount * 0.5 + dwarfCount * 120;
  if (intensity < 5000) return "Sehr klein";
  if (intensity < 12000) return "Kleine Siedlung";
  if (intensity < 22000) return "Mittlere Kolonie";
  if (intensity < 34000) return "Große Expedition";
  return "Große Festung";
}

function updateWorldSummary() {
  const mapWidth = Number(settings.mapWidth.value);
  const mapHeight = Number(settings.mapHeight.value);
  const dwarfCount = Number(settings.dwarfCount.value);
  const tileCount = mapWidth * mapHeight;

  summaryElements.dimensions.textContent = `${mapWidth} x ${mapHeight}`;
  summaryElements.tiles.textContent = tileCount.toLocaleString("de-DE");
  summaryElements.dwarves.textContent = dwarfCount.toString();
  summaryElements.scale.textContent = getSettlementScale(tileCount, dwarfCount);
}

function applyDefaults() {
  Object.keys(settings).forEach((name) => {
    settings[name].value = defaults[name];
    updateOutput(name);
  });
  updateWorldSummary();
}

Object.keys(settings).forEach((name) => {
  settings[name].addEventListener("input", () => {
    updateOutput(name);
    updateWorldSummary();
  });
});

resetDefaultsButton.addEventListener("click", applyDefaults);
applyDefaults();

// Liste der Bilder, die vorgeladen werden müssen
const imagePaths = [
  "public/img/water.jpg",
  "public/img/grass.jpg",
  "public/img/mountain.jpg",
  "public/img/wood.jpg",
  "public/img/dwarf.jpg",
  "public/img/wood_home.jpg",
];

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const mapWidth = Number(settings.mapWidth.value);
  const mapHeight = Number(settings.mapHeight.value);
  const dwarfCount = Number(settings.dwarfCount.value);
  const moveInterval = Number(settings.moveInterval.value);
  const inventoryLimit = Number(settings.inventoryLimit.value);

  GAME_CONFIG.INVENTORY_LIMIT = inventoryLimit;

  const level = new Level(mapWidth, mapHeight);
  const dwarves = createInitialDwarves(level.tilemap, dwarfCount);
  const worldState = createWorldState(level, dwarves);

  canvas.width = worldState.getActiveLevel().width * TILE_SIZE;
  canvas.height = worldState.getActiveLevel().height * TILE_SIZE;

  startScreen.classList.add("is-hidden");
  canvas.classList.remove("is-hidden");

  preloadImages(imagePaths, () =>
    startGameLoop({
      ctx,
      canvas,
      level: worldState.getActiveLevel(),
      dwarves: worldState.dwarves,
      imageCache,
      moveInterval,
      drawMap,
      drawDwarves,
    })
  );
});
