import { GAME_CONFIG } from "./config.js";

function finalizeBuilding(dwarf, tilemap, targetX, targetY) {
  if (
    tilemap[targetY] && tilemap[targetY][targetX] === "grass" &&
    dwarf.inventory.length === dwarf.maxInventorySize
  ) {
    tilemap[targetY][targetX] = "wood_home";
    dwarf.inventory = [];
    console.log("Holzhaus gebaut!");
    return "completed";
  }

  console.log("Holzhausbau ohne Effekt beendet");
  return "cancelled";
}

export function buildWoodHome(dwarf, tilemap) {
  if (dwarf.buildingAction) {
    dwarf.status = "building";
    dwarf.buildingAction.remainingTicks -= 1;

    if (dwarf.buildingAction.remainingTicks > 0) {
      return "in_progress";
    }

    const { targetX, targetY } = dwarf.buildingAction;
    dwarf.buildingAction = null;
    return finalizeBuilding(dwarf, tilemap, targetX, targetY);
  }

  if (dwarf.inventory.length === dwarf.maxInventorySize) {
    const newY = dwarf.y;
    const newX = dwarf.x;

    if (tilemap[newY] && tilemap[newY][newX] === "grass") {
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
      return finalizeBuilding(dwarf, tilemap, newX, newY);
    } else {
      console.log("Das aktuelle Feld ist nicht geeignet, um ein Holzhaus zu bauen!");
    }
  } else {
    console.log("Nicht genug Holz!");
  }

  return "none";
}
