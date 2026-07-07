export function buildWoodHome(dwarf, tilemap) {
  if (dwarf.inventory.length === dwarf.maxInventorySize) {
    const newY = dwarf.y;
    const newX = dwarf.x;

    if (tilemap[newY] && tilemap[newY][newX] === "grass") {
      tilemap[newY][newX] = "wood_home";
      dwarf.inventory = [];
      console.log("Holzhaus gebaut!");
    } else {
      console.log("Das aktuelle Feld ist nicht geeignet, um ein Holzhaus zu bauen!");
    }
  } else {
    console.log("Nicht genug Holz!");
  }
}
