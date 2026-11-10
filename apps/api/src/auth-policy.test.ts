import { describe, expect, it } from 'vitest';
import { mayUseDefaultWorkspace } from './auth-policy.js';

describe('single-user workspace downgrade protection', () => {
  it('permits anonymous local access only when no gate is configured', () => {
    expect(mayUseDefaultWorkspace(null, undefined)).toBe(true);
    expect(mayUseDefaultWorkspace(null, 'correct-token')).toBe(false);
  });

  it('refuses arbitrary or empty bearer values in open mode', () => {
    expect(mayUseDefaultWorkspace('bogus-token', undefined)).toBe(false);
    expect(mayUseDefaultWorkspace('', undefined)).toBe(false);
  });

  it('requires the exact configured access token', () => {
    expect(mayUseDefaultWorkspace('valid-token', 'valid-token')).toBe(true);
    expect(mayUseDefaultWorkspace('invalid-token', 'valid-token')).toBe(false);
  });

  it('does not accept API-key lookalikes as anonymous access', () => {
    expect(mayUseDefaultWorkspace('cb_invalid_key', undefined)).toBe(false);
    expect(mayUseDefaultWorkspace('cb_invalid_key', 'operator-token')).toBe(false);
  });
});
