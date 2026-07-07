export function startGameLoop({
  ctx,
  canvas,
  worldState,
  dwarves,
  imageCache,
  moveInterval,
  drawMap,
  drawDwarves,
}) {
  let lastMoveTime = 0;

  function gameLoop(timestamp) {
    const level = worldState.getActiveLevel();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx, level, imageCache);

    if (timestamp - lastMoveTime > moveInterval) {
      dwarves.forEach((dwarf) => dwarf.move(level.tilemap, worldState));
      lastMoveTime = timestamp;
    }

    drawDwarves(ctx, dwarves, imageCache);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
