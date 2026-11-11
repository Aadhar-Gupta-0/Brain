import { describe, expect, it } from 'vitest';
import {
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_STARTERS,
  filterPlaybookStarters,
} from './playbook-starters.js';

describe('playbook starter library', () => {
  it('provides a substantial, structured set of topics', () => {
    expect(PLAYBOOK_STARTERS.length).toBeGreaterThanOrEqual(60);
    expect(PLAYBOOK_CATEGORIES[0]).toBe('All');
  });

  it('uses distinct stable identifiers for every playbook', () => {
    const ids = PLAYBOOK_STARTERS.map((starter) => starter.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  });

  it('constrains prompts to the existing playbook API schema', () => {
    expect(PLAYBOOK_STARTERS.every((starter) =>
      starter.title.trim().length > 0 &&
      starter.topic.trim().length > 0 &&
      starter.topic.length <= 300
    )).toBe(true);
  });

  it('only assigns supported categories', () => {
    expect(PLAYBOOK_STARTERS.every((starter) =>
      PLAYBOOK_CATEGORIES.includes(starter.category))).toBe(true);
  });

  it('provides relevant topics for all supported departments', () => {
    for (const category of PLAYBOOK_CATEGORIES) {
      if (category === 'All') continue;
      expect(filterPlaybookStarters('', category).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('searches title, category, and prompt without case sensitivity', () => {
    expect(filterPlaybookStarters('ROLLBACK').some((starter) => starter.id === 'eng-rollback')).toBe(true);
    expect(filterPlaybookStarters('security').length).toBeGreaterThan(0);
    expect(filterPlaybookStarters('security').every((starter) =>
      [starter.category, starter.title, starter.topic]
        .some((value) => value.toLowerCase().includes('security')))).toBe(true);
  });

  it('respects the department filter and returns empty matches cleanly', () => {
    expect(filterPlaybookStarters('release', 'Finance')).toEqual([]);
    expect(filterPlaybookStarters('missing-unlikely-phrase')).toEqual([]);
    expect(filterPlaybookStarters('', 'Legal').every((starter) => starter.category === 'Legal')).toBe(true);
  });

  it('never includes fabricated company-specific names or policy answers', () => {
    expect(PLAYBOOK_STARTERS.every((starter) => starter.topic.endsWith('?'))).toBe(true);
    expect(PLAYBOOK_STARTERS.every((starter) => !/\bpassword\s*=|api[_-]?key\s*=/.test(starter.topic))).toBe(true);
  });
});
