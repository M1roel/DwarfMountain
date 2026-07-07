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

export function decideNextJob(dwarf, worldState) {
  const tilemap = getActiveTilemap(worldState);

  if (hasWoodInInventory(dwarf)) {
    return JOB_TYPES.DEPOSIT_WOOD;
  }

  if (canBuildHouseNow(dwarf, worldState, tilemap)) {
    return JOB_TYPES.BUILD_HOUSE;
  }

  if (canGatherWoodNow(dwarf, tilemap)) {
    return JOB_TYPES.GATHER_WOOD;
  }

  return JOB_TYPES.IDLE;
}
