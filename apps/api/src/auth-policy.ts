/**
 * Gate access to the default single-user workspace.
 *
 * No credential is intentional only for an explicitly ungated local instance.
 * When a token is provided, it must be the configured access token, never an
 * arbitrary value that silently downgrades to anonymous access.
 *
 * API key lookup happens separately before calling this function.
 */
export function mayUseDefaultWorkspace(
  presentedToken: string | null,
  accessToken: string | undefined,
): boolean {
  if (accessToken) return presentedToken === accessToken;
  return presentedToken === null;
}
