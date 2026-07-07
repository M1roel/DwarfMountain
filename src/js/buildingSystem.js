import { GAME_CONFIG } from "./config.js";

const WOOD_HOME_COST = 5;

function finalizeBuilding(tilemap, targetX, targetY) {
  if (tilemap[targetY] && tilemap[targetY][targetX] === "grass") {
    tilemap[targetY][targetX] = "wood_home";
    console.log("Holzhaus gebaut!");
    return "completed";
  }

  console.log("Holzhausbau ohne Effekt beendet");
  return "cancelled";
}

export function buildWoodHome(dwarf, tilemap, worldState) {
  const storage = worldState?.storage;

  if (dwarf.buildingAction) {
    dwarf.status = "building";
    dwarf.buildingAction.remainingTicks -= 1;

    if (dwarf.buildingAction.remainingTicks > 0) {
      return "in_progress";
    }

    const { targetX, targetY } = dwarf.buildingAction;
    dwarf.buildingAction = null;
    const buildResult = finalizeBuilding(tilemap, targetX, targetY);

    if (buildResult === "cancelled" && storage) {
      storage.wood += WOOD_HOME_COST;
    }

    return buildResult;
  }

  if (storage?.wood >= WOOD_HOME_COST) {
    const newY = dwarf.y;
    const newX = dwarf.x;

    if (tilemap[newY] && tilemap[newY][newX] === "grass") {
      storage.wood -= WOOD_HOME_COST;
      dwarf.buildingAction = {
        targetX: newX,
        targetY: newY,
        remainingTicks: GAME_CONFIG.BUILDING_TICKS,
      };
      dwarf.status = "building";
      dwarf.buildingAction.remainingTicks -= 1;

      if (dwarf.buildingAction.remainingTicks > 0) {
        return "in_progress";
      }

      dwarf.buildingAction = null;
      const buildResult = finalizeBuilding(tilemap, newX, newY);

      if (buildResult === "cancelled") {
        storage.wood += WOOD_HOME_COST;
      }

      return buildResult;
    } else {
      console.log("Das aktuelle Feld ist nicht geeignet, um ein Holzhaus zu bauen!");
    }
  } else {
    console.log("Nicht genug Holz!");
  }

  return "none";
}
