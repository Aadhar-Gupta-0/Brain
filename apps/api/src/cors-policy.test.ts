import { describe, expect, it } from 'vitest';
import { buildCorsPolicy } from './cors-policy.js';

describe('buildCorsPolicy', () => {
  it('does not send credentials with wildcard origin', () => {
    const policy = buildCorsPolicy(['*']);
    expect(policy.credentials).toBe(false);
    expect(policy.origin('https://attacker.example')).toBe('*');
  });

  it('reflects only explicitly approved origins with credentials', () => {
    const policy = buildCorsPolicy(['https://dashboard.example', 'http://localhost:3000']);
    expect(policy.credentials).toBe(true);
    expect(policy.origin('https://dashboard.example')).toBe('https://dashboard.example');
    expect(policy.origin('https://attacker.example')).toBe('');
  });

  it('handles empty allowlists without allowing any origin', () => {
    const policy = buildCorsPolicy([]);
    expect(policy.origin('https://attacker.example')).toBe('');
  });

  it('a wildcard overrides other origins without leaking credentials', () => {
    const policy = buildCorsPolicy(['https://dashboard.example', '*']);
    expect(policy.credentials).toBe(false);
    expect(policy.origin('https://attacker.example')).toBe('*');
  });
});
