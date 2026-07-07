import { Dwarf } from "../models/dwarf.class.js";

export function generateDwarfOnGrass(tilemap) {
  return generateDwarfOnGrassWithId(tilemap, null);
}

function generateDwarfOnGrassWithId(tilemap, id) {
  let x, y;
  do {
    x = Math.floor(Math.random() * tilemap[0].length); // Zufaellige X-Koordinate
    y = Math.floor(Math.random() * tilemap.length); // Zufaellige Y-Koordinate
  } while (tilemap[y][x] !== "grass"); // Wiederhole, bis ein "grass"-Tile gefunden wird

  return new Dwarf(x, y, id); // Erstelle einen Zwerg auf der gefundenen Position
}

function findSettlementCenter(tilemap) {
  const centerX = Math.floor(tilemap[0].length / 2);
  const centerY = Math.floor(tilemap.length / 2);
  const maxRadius = Math.max(tilemap[0].length, tilemap.length);

  for (let radius = 0; radius < maxRadius; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (tilemap[y] && tilemap[y][x] === "grass") {
          tilemap[y][x] = "camp_center";
          return { x, y };
        }
      }
    }
  }

  return null;
}

function getSpawnAroundCenter(tilemap, center) {
  const spawnRadius = 4;
  const candidates = [];

  for (let dy = -spawnRadius; dy <= spawnRadius; dy++) {
    for (let dx = -spawnRadius; dx <= spawnRadius; dx++) {
      const x = center.x + dx;
      const y = center.y + dy;

      if (tilemap[y] && tilemap[y][x] === "grass") {
        candidates.push({ x, y });
      }
    }
  }

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : null;
}

export function createInitialDwarves(tilemap, dwarfCount) {
  const settlementCenter = findSettlementCenter(tilemap);

  if (!settlementCenter) {
    return Array.from({ length: dwarfCount }, (_, index) =>
      generateDwarfOnGrassWithId(tilemap, index)
    );
  }

  return Array.from({ length: dwarfCount }, (_, index) => {
    const spawnPoint = getSpawnAroundCenter(tilemap, settlementCenter);
    return spawnPoint
      ? new Dwarf(spawnPoint.x, spawnPoint.y, index)
      : generateDwarfOnGrassWithId(tilemap, index);
  });
}
