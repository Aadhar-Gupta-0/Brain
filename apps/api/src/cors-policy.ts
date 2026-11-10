/**
 * Credential-safe CORS policy.
 *
 * A wildcard is useful for public token-authenticated API clients, but it
 * must not be paired with Allow-Credentials or origin reflection, which would
 * enable cross-site reads of cookie-authenticated sessions.
 */
export function buildCorsPolicy(origins: readonly string[]) {
  const allowAny = origins.includes('*');
  const allowed = new Set(origins.filter((origin) => origin !== '*'));
  return {
    origin: (origin: string) => (allowAny ? '*' : allowed.has(origin) ? origin : ''),
    credentials: !allowAny,
  };
}
