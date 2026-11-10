/**
 * Reciprocal Rank Fusion. Combines several ranked lists into one, rewarding
 * items that rank highly across lists without needing score calibration.
 *
 *   score(item) = sum_over_lists( weight_l / (k + rank_l(item)) )
 */
export interface RankedList<T> {
  items: T[];
  weight?: number;
}

export function reciprocalRankFusion<T>(
  lists: RankedList<T>[],
  key: (item: T) => string,
  k = 60,
): { item: T; score: number; components: Record<number, number> }[] {
  if (!Number.isFinite(k) || k < 0) {
    throw new RangeError('RRF k must be a finite, non-negative number');
  }
  const scores = new Map<string, { item: T; score: number; components: Record<number, number> }>();

  lists.forEach((list, listIdx) => {
    const weight = list.weight ?? 1;
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError('RRF weight must be finite and non-negative');
    }
    // An upstream search provider can return repeated IDs. Each ranked list
    // should contribute only once per document or duplicates inflate relevance.
    const seen = new Set<string>();
    list.items.forEach((item, rank) => {
      const id = key(item);
      if (seen.has(id)) return;
      seen.add(id);
      const contribution = weight / (k + rank + 1);
      const existing = scores.get(id);
      if (existing) {
        existing.score += contribution;
        existing.components[listIdx] = contribution;
      } else {
        scores.set(id, { item, score: contribution, components: { [listIdx]: contribution } });
      }
    });
  });

  return Array.from(scores.values()).sort((a, b) => b.score - a.score);
}
