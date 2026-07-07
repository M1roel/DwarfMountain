export function createWorldState(level, dwarves, settlementCenter = null) {
  const undergroundLevel = {
    width: level.width,
    height: level.height,
    tilemap: Array.from({ length: level.height }, () =>
      Array.from({ length: level.width }, () => "stone")
    ),
  };

  const levels = {
    0: level,
    [-1]: undergroundLevel,
  };

  const state = {
    level,
    dwarves,
    levels,
    activeZ: 0,
    settlementCenter,
    storage: {
      wood: 0,
    },
  };

  const getActiveLevel = () => state.levels[state.activeZ];
  const getLevel = (z) => state.levels[z];

  return {
    ...state,
    getActiveLevel,
    getLevel,
  };
}
