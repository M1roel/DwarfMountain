import { GAME_CONFIG } from "./config.js";

function finalizeGathering(dwarf, tilemap, targetX, targetY) {
  if (
    tilemap[targetY] && tilemap[targetY][targetX] === "wood" &&
    dwarf.inventory.length < dwarf.maxInventorySize
  ) {
    dwarf.inventory.push("wood");
    console.log("Holz gesammelt!");
    tilemap[targetY][targetX] = "grass";
    return "completed";
  }

  console.log("Holzabbau ohne Effekt beendet");
  return "cancelled";
}

export function collectRessources(dwarf, tilemap) {
  if (dwarf.gatheringAction) {
    dwarf.status = "gathering";
    dwarf.gatheringAction.remainingTicks -= 1;

    if (dwarf.gatheringAction.remainingTicks > 0) {
      return "in_progress";
    }

    const { targetX, targetY } = dwarf.gatheringAction;
    dwarf.gatheringAction = null;
    return finalizeGathering(dwarf, tilemap, targetX, targetY);
  }

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let [dy, dx] of directions) {
    const newY = dwarf.y + dy;
    const newX = dwarf.x + dx;

    if (
      tilemap[newY] && tilemap[newY][newX] === "wood" &&
      dwarf.inventory.length < dwarf.maxInventorySize
    ) {
      dwarf.gatheringAction = {
        targetX: newX,
        targetY: newY,
        remainingTicks: GAME_CONFIG.GATHERING_TICKS,
      };
      dwarf.status = "gathering";
      dwarf.gatheringAction.remainingTicks -= 1;
      if (dwarf.gatheringAction.remainingTicks > 0) {
        return "in_progress";
      }

      dwarf.gatheringAction = null;
      return finalizeGathering(dwarf, tilemap, newX, newY);
    }
  }
  console.log("Kein Holz zum sammeln oder Inventar voll");
  return "none";
}
