export function createWorldState(level, dwarves) {
  const getActiveLevel = () => level;

  return {
    level,
    dwarves,
    getActiveLevel,
  };
}
