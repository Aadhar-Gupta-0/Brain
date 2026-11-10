import { describe, it, expect } from 'vitest';
import { addSchema, MAX_CONTENT } from './memories.js';
import { searchSchema } from './search.js';
import { chatSchema } from './chat.js';

describe('memories addSchema bounds', () => {
  it('accepts a normal memory', () => {
    const r = addSchema.safeParse({ content: 'a decision we made', tags: ['eng', 'release'] });
    expect(r.success).toBe(true);
  });

  it('rejects content past the size cap so one request cannot spawn unbounded embedding work', () => {
    const ok = addSchema.safeParse({ content: 'x'.repeat(MAX_CONTENT) });
    expect(ok.success).toBe(true);
    const tooBig = addSchema.safeParse({ content: 'x'.repeat(MAX_CONTENT + 1) });
    expect(tooBig.success).toBe(false);
  });

  it('caps the tag list length and per-tag length', () => {
    expect(addSchema.safeParse({ content: 'c', tags: Array(51).fill('t') }).success).toBe(false);
    expect(addSchema.safeParse({ content: 'c', tags: ['x'.repeat(65)] }).success).toBe(false);
    expect(addSchema.safeParse({ content: 'c', tags: Array(50).fill('t') }).success).toBe(true);
  });

  it('bounds sourceType', () => {
    expect(addSchema.safeParse({ content: 'c', sourceType: 'x'.repeat(65) }).success).toBe(false);
  });

  it('bounds serialized metadata size', () => {
    expect(addSchema.safeParse({ content: 'c', metadata: { a: 1, b: 'ok' } }).success).toBe(true);
    const huge = { blob: 'x'.repeat(100_001) };
    expect(addSchema.safeParse({ content: 'c', metadata: huge }).success).toBe(false);
  });

  it('accepts a media data URL in place of content', () => {
    // A normal-sized data URL is well under the per-medium caps; the caps
    // themselves use the same .max() the content test exercises.
    const r = addSchema.safeParse({ image: 'data:image/png;base64,iVBORw0KGgo=' });
    expect(r.success).toBe(true);
  });
});

describe('search searchSchema bounds', () => {
  it('accepts a normal query', () => {
    expect(searchSchema.safeParse({ q: 'how do we ship?', tags: ['eng'] }).success).toBe(true);
  });

  it('rejects an over-long query and an oversized tag filter', () => {
    expect(searchSchema.safeParse({ q: 'x'.repeat(1001) }).success).toBe(false);
    expect(searchSchema.safeParse({ q: 'ok', tags: Array(51).fill('t') }).success).toBe(false);
  });
});


describe('chat input cost and context bounds', () => {
  it('accepts compact valid conversation history', () => {
    expect(chatSchema.safeParse({
      message: 'What changed last week?',
      history: [{ role: 'user', content: 'Summarize our release' }],
    }).success).toBe(true);
  });

  it('rejects overlong individual history items', () => {
    expect(chatSchema.safeParse({
      message: 'Summarize',
      history: [{ role: 'assistant', content: 'a'.repeat(8_001) }],
    }).success).toBe(false);
  });

  it('rejects more than 30 messages and empty items', () => {
    expect(chatSchema.safeParse({
      message: 'Summarize',
      history: Array(31).fill({ role: 'user', content: 'ping' }),
    }).success).toBe(false);
    expect(chatSchema.safeParse({
      message: 'Summarize',
      history: [{ role: 'user', content: '' }],
    }).success).toBe(false);
  });
});
