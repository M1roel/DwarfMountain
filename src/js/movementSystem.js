export function applyTargetPosition(dwarf) {
  dwarf.x = dwarf.targetX;
  dwarf.y = dwarf.targetY;
  dwarf.targetX = undefined;
  dwarf.targetY = undefined;
}

export function setRandomTarget(dwarf, tilemap) {
  let directions = [0, 1, 2, 3]; // 0=oben, 1=rechts, 2=unten, 3=links
  let found = false;

  while (directions.length > 0 && !found) {
    let index = Math.floor(Math.random() * directions.length);
    let direction = directions.splice(index, 1)[0]; // Eine Richtung zufaellig auswaehlen & entfernen

    let newX = dwarf.x;
    let newY = dwarf.y;

    switch (direction) {
      case 0:
        newY -= 1;
        break;
      case 1:
        newX += 1;
        break;
      case 2:
        newY += 1;
        break;
      case 3:
        newX -= 1;
        break;
    }

    if (tilemap[newY] && tilemap[newY][newX] === "grass") {
      dwarf.targetX = newX;
      dwarf.targetY = newY;
      dwarf.status = "moving";
      found = true;
    }
  }

  if (!found) {
    dwarf.status = "idle";
  }
}
