export function findMountain(dwarf, tilemap) {
  for (let y = 0; y < tilemap.length - 4; y++) {
    for (let x = 0; x < tilemap[0].length - 4; x++) {
      let isMountain = true;

      // Pruefe, ob das ganze 5x5-Feld aus "mountain" besteht
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (tilemap[y + i][x + j] !== "mountain") {
            isMountain = false;
            break;
          }
        }
        if (!isMountain) break;
      }

      if (isMountain) {
        dwarf.targetX = x + 2; // Setze das Ziel in die Mitte des Berges
        dwarf.targetY = y + 2;
        dwarf.state = "digging"; // Wechsle in den Grab-Modus
        return;
      }
    }
  }
}

export function startDigging(dwarf, tilemap) {
  // Graebt 2 Felder in den Berg
  for (let i = 0; i < 2; i++) {
    if (tilemap[dwarf.y + i] && tilemap[dwarf.y + i][dwarf.x] === "mountain") {
      tilemap[dwarf.y + i][dwarf.x] = "grass"; // Aendere das Feld zu "grass"
    }
  }

  dwarf.state = "expanding"; // Wechsle in den Modus, um ein 3x3-Feld zu graben
}

export function expandCave(dwarf, tilemap) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      let newY = dwarf.y + dy;
      let newX = dwarf.x + dx;

      if (tilemap[newY] && tilemap[newY][newX] === "mountain") {
        tilemap[newY][newX] = "grass"; // Ersetze das Tile mit "grass"
      }
    }
  }
}
