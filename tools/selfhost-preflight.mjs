#!/usr/bin/env node
/**
 * Read-only security preflight for a self-hosted CompanyBrain deployment.
 * No keys are printed or transmitted.
 */
import { readFileSync } from 'node:fs';

export function inspectEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const split = trimmed.indexOf('=');
    if (split < 1) continue;
    const key = trimmed.slice(0, split).trim();
    let value = trimmed.slice(split + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  const findings = [];
  const exposed = /^(0\.0\.0\.0|::|\[::\])$/;
  if (exposed.test(env.API_HOST || '127.0.0.1') && !env.ACCESS_TOKEN && (env.AUTH_MODE || 'single') !== 'multi') {
    findings.push({ level:'critical', code:'PUBLIC_API_NO_AUTH', message:'Public API binding without access token or multi-user authentication' });
  }
  for (const key of ['JWT_SECRET','DATABASE_URL','ACCESS_TOKEN']) {
    const value=env[key];
    if (value && /^(change.?me|your.?secret|example|placeholder|default|123456)$/i.test(value)) {
      findings.push({ level:'high', code:'PLACEHOLDER_SECRET', message:key+' uses a recognizable placeholder' });
    }
  }
  if ((env.AUTH_MODE || 'single') === 'multi' && !env.JWT_SECRET) {
    findings.push({ level:'high', code:'MISSING_JWT_SECRET', message:'Multi-user mode requires a server-side JWT secret' });
  }
  if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
    findings.push({ level:'high', code:'MISSING_DATABASE_URL', message:'Production deployment requires a database URL' });
  }
  return findings;
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const file=process.argv[2];
  if (!file) {
    console.error('Usage: node tools/selfhost-preflight.mjs /path/to/private/.env');
    process.exit(2);
  }
  try {
    const findings=inspectEnv(readFileSync(file,'utf8'));
    console.log(JSON.stringify({ result:findings.length ? 'review_required' : 'no_findings', findings },null,2));
    process.exitCode=findings.length ? 1 : 0;
  } catch {
    console.error('Unable to read local configuration. No credentials were displayed.');
    process.exitCode=2;
  }
}
