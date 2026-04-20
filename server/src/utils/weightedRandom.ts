export function weightedRandom<T extends { weight: number; isEnabled: boolean }>(items: T[]): T | null {
  const enabledItems = items.filter(item => item.isEnabled);
  if (enabledItems.length === 0) return null;

  const totalWeight = enabledItems.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of enabledItems) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }

  return enabledItems[0];
}
