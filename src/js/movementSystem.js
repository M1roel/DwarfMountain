import { isWalkable } from "./passability.js";

export function applyTargetPosition(dwarf) {
  dwarf.x = dwarf.targetX;
  dwarf.y = dwarf.targetY;
  dwarf.targetX = undefined;
  dwarf.targetY = undefined;
}

export function setRandomTarget(dwarf, tilemap) {
  const neighbors = [
    { x: dwarf.x, y: dwarf.y - 1 },
    { x: dwarf.x + 1, y: dwarf.y },
    { x: dwarf.x, y: dwarf.y + 1 },
    { x: dwarf.x - 1, y: dwarf.y },
  ];

  const walkableNeighbors = neighbors.filter(
    ({ x, y }) => tilemap[y] && isWalkable(tilemap[y][x])
  );

  if (walkableNeighbors.length === 0) {
    dwarf.status = "idle";
    return;
  }

  const randomNeighbor =
    walkableNeighbors[Math.floor(Math.random() * walkableNeighbors.length)];

  dwarf.targetX = randomNeighbor.x;
  dwarf.targetY = randomNeighbor.y;
  dwarf.status = "moving";
}
