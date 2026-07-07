export function startGameLoop({
  ctx,
  canvas,
  level,
  dwarves,
  imageCache,
  moveInterval,
  drawMap,
  drawDwarves,
}) {
  let lastMoveTime = 0;

  function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx, level, imageCache);

    if (timestamp - lastMoveTime > moveInterval) {
      dwarves.forEach((dwarf) => dwarf.move(level.tilemap));
      lastMoveTime = timestamp;
    }

    drawDwarves(ctx, dwarves, imageCache);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
