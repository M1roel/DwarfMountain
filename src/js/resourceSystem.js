export function collectRessources(dwarf, tilemap) {
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
      dwarf.inventory.push("wood");
      dwarf.status = "gathering";
      console.log("Holz gesammelt!");
      tilemap[newY][newX] = "grass";
      return true;
    }
  }
  console.log("Kein Holz zum sammeln oder Inventar voll");
  return false;
}
