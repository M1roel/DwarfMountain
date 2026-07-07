const WALKABLE_TILES = new Set(["grass"]);

const BLOCKING_TILES = new Set([
  "water",
  "mountain",
  "stone",
  "wood",
  "wood_home",
  "unknown",
]);

export function isWalkable(tileType) {
  return WALKABLE_TILES.has(tileType);
}

export function isBlocking(tileType) {
  return BLOCKING_TILES.has(tileType);
}
