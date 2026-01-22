/**
 * Evenly splits a cleanerPrice across multiple cleaners with 2dp precision.
 * If the split is uneven, the first cleaner receives the rounding remainder.
 * @param {number} total - cleanerPrice to distribute
 * @param {string[]} cleanerIds - array of cleaner ids
 * @returns {{ id: string, amount: number }[]}
 */
export function splitCleanerPrice(total, cleanerIds = []) {
  const amount = Number(total);
  if (!cleanerIds.length || Number.isNaN(amount) || amount === 0) {
    return cleanerIds.map((id) => ({ id, amount: 0 }));
  }

  const count = cleanerIds.length;
  const base = Math.floor((amount / count) * 100) / 100; // 2dp floor
  let distributed = base * count;
  const remainder = Number((amount - distributed).toFixed(2));

  return cleanerIds.map((id, index) => {
    const extra = index === 0 ? remainder : 0;
    const value = Number((base + extra).toFixed(2));
    distributed += extra;
    return { id, amount: value };
  });
}
