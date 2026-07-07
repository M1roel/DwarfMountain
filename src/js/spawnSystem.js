import { Dwarf } from "../models/dwarf.class.js";

export function generateDwarfOnGrass(tilemap) {
  let x, y;
  do {
    x = Math.floor(Math.random() * tilemap[0].length); // Zufaellige X-Koordinate
    y = Math.floor(Math.random() * tilemap.length); // Zufaellige Y-Koordinate
  } while (tilemap[y][x] !== "grass"); // Wiederhole, bis ein "grass"-Tile gefunden wird

  return new Dwarf(x, y); // Erstelle einen Zwerg auf der gefundenen Position
}

export function createInitialDwarves(tilemap, dwarfCount) {
  return Array.from({ length: dwarfCount }, () => generateDwarfOnGrass(tilemap));
}
