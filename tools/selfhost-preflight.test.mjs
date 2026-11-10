import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectEnv } from './selfhost-preflight.mjs';
test('detects publicly bound unauthenticated API', () => {
  assert(inspectEnv('API_HOST=0.0.0.0\nAUTH_MODE=single').some(x=>x.code==='PUBLIC_API_NO_AUTH'));
});
test('allows authenticated public API', () => {
  assert(!inspectEnv('API_HOST=0.0.0.0\nACCESS_TOKEN=long-unique-secret').some(x=>x.code==='PUBLIC_API_NO_AUTH'));
});
test('detects unsafe placeholders', () => {
  assert(inspectEnv('JWT_SECRET=changeme').some(x=>x.code==='PLACEHOLDER_SECRET'));
});
test('checks multi-user JWT', () => {
  assert(inspectEnv('AUTH_MODE=multi').some(x=>x.code==='MISSING_JWT_SECRET'));
});
test('does not log or include secret values', () => {
  assert(!JSON.stringify(inspectEnv('ACCESS_TOKEN=supersecretvalue')).includes('supersecretvalue'));
});
