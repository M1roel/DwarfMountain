import { GAME_CONFIG } from "./config.js";

const { TILE_SIZE } = GAME_CONFIG;

export function drawMap(ctx, level, imageCache) {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      let tile = level.tilemap[y][x];
      const img = imageCache[`public/img/${tile}.jpg`];
      if (img) {
        ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (tile === "stone") {
        ctx.fillStyle = "#6a6a6a";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (tile === "unknown") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

export function drawDwarves(ctx, dwarves, imageCache) {
  dwarves.forEach((dwarf) => {
    const img = imageCache[dwarf.sprite];
    if (img) {
      ctx.drawImage(
        img,
        dwarf.x * TILE_SIZE,
        dwarf.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  });
}
