import { JOB_TYPES } from "./jobModel.js";

const BUILD_HOUSE_COST = 5;

function getActiveTilemap(worldState) {
  if (!worldState) {
    return null;
  }

  if (typeof worldState.getActiveLevel === "function") {
    return worldState.getActiveLevel()?.tilemap ?? null;
  }

  return worldState.level?.tilemap ?? null;
}

function hasWoodInInventory(dwarf) {
  if (!dwarf) {
    return false;
  }

  return Array.isArray(dwarf.inventory) && dwarf.inventory.some((item) => item === "wood");
}

function canBuildHouseNow(dwarf, worldState, tilemap) {
  if (!dwarf || !worldState?.storage || !tilemap) {
    return false;
  }

  if (worldState.storage.wood < BUILD_HOUSE_COST) {
    return false;
  }

  return Boolean(tilemap[dwarf.y] && tilemap[dwarf.y][dwarf.x] === "grass");
}

function canGatherWoodNow(dwarf, tilemap) {
  if (!dwarf || !tilemap || !Array.isArray(dwarf.inventory)) {
    return false;
  }

  if (dwarf.inventory.length >= dwarf.maxInventorySize) {
    return false;
  }

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dy, dx] of directions) {
    const y = dwarf.y + dy;
    const x = dwarf.x + dx;

    if (tilemap[y] && tilemap[y][x] === "wood") {
      return true;
    }
  }

  return false;
}

function getPriority(worldState, jobType) {
  const priorities = worldState?.jobPriorities;

  if (!priorities) {
    return 0;
  }

  const keyByJobType = {
    [JOB_TYPES.GATHER_WOOD]: "gather_wood",
    [JOB_TYPES.DEPOSIT_WOOD]: "deposit_wood",
    [JOB_TYPES.BUILD_HOUSE]: "build_house",
  };

  const key = keyByJobType[jobType];
  if (!key) {
    return 0;
  }

  const value = Number(priorities[key]);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function pickWeightedJob(candidates) {
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);

  if (totalWeight <= 0) {
    return JOB_TYPES.IDLE;
  }

  let roll = Math.random() * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll < 0) {
      return candidate.type;
    }
  }

  return candidates[candidates.length - 1].type;
}

export function decideNextJob(dwarf, worldState) {
  const tilemap = getActiveTilemap(worldState);

  if (hasWoodInInventory(dwarf)) {
    return JOB_TYPES.DEPOSIT_WOOD;
  }

  const candidates = [];

  if (canBuildHouseNow(dwarf, worldState, tilemap)) {
    const buildPriority = getPriority(worldState, JOB_TYPES.BUILD_HOUSE);
    if (buildPriority > 0) {
      candidates.push({ type: JOB_TYPES.BUILD_HOUSE, weight: buildPriority });
    }
  }

  if (canGatherWoodNow(dwarf, tilemap)) {
    const gatherPriority = getPriority(worldState, JOB_TYPES.GATHER_WOOD);
    if (gatherPriority > 0) {
      candidates.push({ type: JOB_TYPES.GATHER_WOOD, weight: gatherPriority });
    }
  }

  if (candidates.length > 0) {
    return pickWeightedJob(candidates);
  }

  return JOB_TYPES.IDLE;
}
