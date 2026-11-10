import { describe, it, expect } from 'vitest';
import { reciprocalRankFusion } from './rrf.js';

const id = (x: string) => x;

describe('reciprocalRankFusion', () => {
  // With k=0 the contribution is weight/(rank+1), so scores are exact and easy to reason about.
  it('scores by reciprocal rank and sorts descending', () => {
    const out = reciprocalRankFusion([{ items: ['a', 'b', 'c'] }], id, 0);
    expect(out.map((r) => r.item)).toEqual(['a', 'b', 'c']);
    expect(out[0]!.score).toBeCloseTo(1);
    expect(out[1]!.score).toBeCloseTo(0.5);
    expect(out[2]!.score).toBeCloseTo(1 / 3);
  });

  it('sums contributions for items appearing in multiple lists', () => {
    // a: rank0 in L0 (1) + rank1 in L1 (0.5) = 1.5 ; b: rank1 in L0 (0.5) + rank0 in L1 (1) = 1.5
    const out = reciprocalRankFusion([{ items: ['a', 'b'] }, { items: ['b', 'a'] }], id, 0);
    const byId = Object.fromEntries(out.map((r) => [r.item, r.score]));
    expect(byId.a).toBeCloseTo(1.5);
    expect(byId.b).toBeCloseTo(1.5);
  });

  it('applies per-list weights', () => {
    const out = reciprocalRankFusion([{ items: ['a'], weight: 2 }, { items: ['a'] }], id, 0);
    expect(out[0]!.score).toBeCloseTo(3); // 2/1 + 1/1
  });

  it('lets an item ranked well in two lists beat one ranked first in a single list', () => {
    const out = reciprocalRankFusion(
      [{ items: ['top', 'shared'] }, { items: ['shared', 'other'] }],
      id,
      0,
    );
    // shared: 0.5 + 1 = 1.5 ; top: 1 ; so shared wins overall.
    expect(out[0]!.item).toBe('shared');
  });

  it('records per-list component contributions', () => {
    const out = reciprocalRankFusion([{ items: ['a'] }, { items: ['a'] }], id, 0);
    expect(out[0]!.components).toEqual({ 0: 1, 1: 1 });
  });

  it('uses k to dampen rank differences (default 60)', () => {
    const out = reciprocalRankFusion([{ items: ['a', 'b'] }], id);
    expect(out[0]!.score).toBeCloseTo(1 / 61);
    expect(out[1]!.score).toBeCloseTo(1 / 62);
  });

  it('does not give the same document multiple contributions from one list', () => {
    const out = reciprocalRankFusion([{ items: ['duplicate', 'duplicate', 'other'] }], id, 0);
    expect(out.find((row) => row.item === 'duplicate')!.score).toBe(1);
    expect(out.find((row) => row.item === 'duplicate')!.components).toEqual({ 0: 1 });
  });

  it('still combines a repeated document once across distinct lists', () => {
    const out = reciprocalRankFusion(
      [{ items: ['a', 'a'] }, { items: ['a', 'a'] }],
      id,
      0,
    );
    expect(out[0]!.score).toBe(2);
  });

  it('rejects negative, NaN and infinite weights or k values', () => {
    expect(() => reciprocalRankFusion([{ items: ['a'] }], id, -1)).toThrow(RangeError);
    expect(() => reciprocalRankFusion([{ items: ['a'] }], id, Number.NaN)).toThrow(RangeError);
    expect(() => reciprocalRankFusion([{ items: ['a'], weight: -1 }], id)).toThrow(RangeError);
    expect(() => reciprocalRankFusion([{ items: ['a'], weight: Number.POSITIVE_INFINITY }], id)).toThrow(RangeError);
  });

});
