const weightedRandomLib = require('weighted-random');

export function weightedRandom<T extends { weight: number; isEnabled: boolean }>(items: T[]): T | null {
  const enabledItems = items.filter(item => item.isEnabled);
  if (enabledItems.length === 0) return null;

  const weights = enabledItems.map(item => item.weight);
  const index = weightedRandomLib(weights);

  return enabledItems[index];
}
