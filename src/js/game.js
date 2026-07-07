import { Level } from "../levels/level.js";
import { GAME_CONFIG } from "./config.js";
import { drawDwarves, drawMap } from "./renderer.js";
import { imageCache, preloadImages } from "./assetLoader.js";
import { createInitialDwarves } from "./spawnSystem.js";
import { startGameLoop } from "./gameLoop.js";
import { createWorldState } from "./worldState.js";
import { JOB_TYPES } from "./jobModel.js";

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
const gameHud = document.getElementById("gameHud");
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
const hudElements = {
  dwarfCount: document.getElementById("hudDwarfCount"),
  activeZ: document.getElementById("hudActiveZ"),
  mapSize: document.getElementById("hudMapSize"),
  tileCount: document.getElementById("hudTileCount"),
  woodTotal: document.getElementById("hudWoodTotal"),
  woodStorage: document.getElementById("hudWoodStorage"),
  settlementCenter: document.getElementById("hudSettlementCenter"),
  woodHomes: document.getElementById("hudWoodHomes"),
  statusIdle: document.getElementById("hudStatusIdle"),
  statusMoving: document.getElementById("hudStatusMoving"),
  statusGathering: document.getElementById("hudStatusGathering"),
  statusBuilding: document.getElementById("hudStatusBuilding"),
  jobIdle: document.getElementById("hudJobIdle"),
  jobGatherWood: document.getElementById("hudJobGatherWood"),
  jobDepositWood: document.getElementById("hudJobDepositWood"),
  jobBuildHouse: document.getElementById("hudJobBuildHouse"),
  priorityGatherWood: document.getElementById("hudPriorityGatherWood"),
  priorityDepositWood: document.getElementById("hudPriorityDepositWood"),
  priorityBuildHouse: document.getElementById("hudPriorityBuildHouse"),
  priorityGatherWoodValue: document.getElementById("hudPriorityGatherWoodValue"),
  priorityDepositWoodValue: document.getElementById("hudPriorityDepositWoodValue"),
  priorityBuildHouseValue: document.getElementById("hudPriorityBuildHouseValue"),
  moveInterval: document.getElementById("hudMoveInterval"),
};

const defaults = {
  mapWidth: DEFAULT_MAP_WIDTH,
  mapHeight: DEFAULT_MAP_HEIGHT,
  dwarfCount: DEFAULT_DWARF_COUNT,
  moveInterval: DEFAULT_MOVE_INTERVAL,
  inventoryLimit: DEFAULT_INVENTORY_LIMIT,
};

const JOB_TYPE_ORDER = [
  JOB_TYPES.IDLE,
  JOB_TYPES.GATHER_WOOD,
  JOB_TYPES.DEPOSIT_WOOD,
  JOB_TYPES.BUILD_HOUSE,
];

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

function countTileType(tilemap, type) {
  let count = 0;
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      if (tilemap[y][x] === type) count++;
    }
  }
  return count;
}

function findTilePosition(tilemap, type) {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      if (tilemap[y][x] === type) {
        return { x, y, z: 0 };
      }
    }
  }

  return null;
}

function setupPriorityControls(worldState) {
  const controls = [
    {
      key: "gather_wood",
      input: hudElements.priorityGatherWood,
      value: hudElements.priorityGatherWoodValue,
    },
    {
      key: "deposit_wood",
      input: hudElements.priorityDepositWood,
      value: hudElements.priorityDepositWoodValue,
    },
    {
      key: "build_house",
      input: hudElements.priorityBuildHouse,
      value: hudElements.priorityBuildHouseValue,
    },
  ];

  controls.forEach(({ key, input, value }) => {
    const priority = worldState.jobPriorities[key];
    input.value = priority.toString();
    value.textContent = priority.toString();

    input.oninput = () => {
      const nextPriority = Number(input.value);
      worldState.jobPriorities[key] = nextPriority;
      value.textContent = nextPriority.toString();
    };
  });
}

function createHudUpdater(worldState, moveInterval) {
  const updateHud = () => {
    const activeLevel = worldState.getActiveLevel();
    const surfaceLevel = worldState.getLevel(0);
    const tileCount = activeLevel.width * activeLevel.height;
    const statusCounts = {
      idle: 0,
      moving: 0,
      gathering: 0,
      building: 0,
    };
    const jobCounts = Object.fromEntries(
      JOB_TYPE_ORDER.map((jobType) => [jobType, 0])
    );
    const woodTotal = worldState.dwarves.reduce(
      (total, dwarf) => {
        const status = statusCounts[dwarf.status] !== undefined ? dwarf.status : "idle";
        statusCounts[status] += 1;
        const jobType = JOB_TYPE_ORDER.includes(dwarf.currentJobType)
          ? dwarf.currentJobType
          : JOB_TYPES.IDLE;
        jobCounts[jobType] += 1;
        return total + dwarf.inventory.filter((item) => item === "wood").length;
      },
      0
    );
    const woodHomes = countTileType(surfaceLevel.tilemap, "wood_home");

    hudElements.dwarfCount.textContent = worldState.dwarves.length.toString();
    hudElements.activeZ.textContent = worldState.activeZ.toString();
    hudElements.mapSize.textContent = `${activeLevel.width} x ${activeLevel.height}`;
    hudElements.tileCount.textContent = tileCount.toLocaleString("de-DE");
    hudElements.woodTotal.textContent = woodTotal.toString();
    hudElements.woodStorage.textContent = worldState.storage.wood.toString();
    hudElements.settlementCenter.textContent = worldState.settlementCenter
      ? `${worldState.settlementCenter.x}/${worldState.settlementCenter.y}`
      : "-";
    hudElements.woodHomes.textContent = woodHomes.toString();
    hudElements.statusIdle.textContent = statusCounts.idle.toString();
    hudElements.statusMoving.textContent = statusCounts.moving.toString();
    hudElements.statusGathering.textContent = statusCounts.gathering.toString();
    hudElements.statusBuilding.textContent = statusCounts.building.toString();
    hudElements.jobIdle.textContent = jobCounts[JOB_TYPES.IDLE].toString();
    hudElements.jobGatherWood.textContent = jobCounts[JOB_TYPES.GATHER_WOOD].toString();
    hudElements.jobDepositWood.textContent = jobCounts[JOB_TYPES.DEPOSIT_WOOD].toString();
    hudElements.jobBuildHouse.textContent = jobCounts[JOB_TYPES.BUILD_HOUSE].toString();
    hudElements.moveInterval.textContent = moveInterval.toString();
  };

  updateHud();
  return window.setInterval(updateHud, 250);
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
  const settlementCenter = findTilePosition(level.tilemap, "camp_center");
  const worldState = createWorldState(level, dwarves, settlementCenter);

  canvas.width = worldState.getActiveLevel().width * TILE_SIZE;
  canvas.height = worldState.getActiveLevel().height * TILE_SIZE;

  startScreen.classList.add("is-hidden");
  canvas.classList.remove("is-hidden");
  gameHud.classList.remove("is-hidden");

  setupPriorityControls(worldState);
  createHudUpdater(worldState, moveInterval);

  preloadImages(imagePaths, () =>
    startGameLoop({
      ctx,
      canvas,
      worldState,
      dwarves: worldState.dwarves,
      imageCache,
      moveInterval,
      drawMap,
      drawDwarves,
    })
  );
});
