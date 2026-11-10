# Self-hosted deployment preflight

Run the included **offline, read-only** environment checker before enabling an externally accessible CompanyBrain service:

\`\`\`bash
node tools/selfhost-preflight.mjs /absolute/path/to/your/private/.env
node --test tools/selfhost-preflight.test.mjs
\`\`\`

The checker reports public binds without authentication, recognizable secret placeholders, and missing production configuration. It never sends telemetry or prints secret values.

**Limits:** Passing the checker is not a security assessment. It does not prove TLS, firewall rules, tenant isolation, role permissions, RLS, backup security, or plugin trust. Follow the project's existing [SECURITY.md](../SECURITY.md) and production documentation.

The preflight checker and its regression tests are an independent operational extension for this maintained edition; the original MIT copyright and contributor notices are retained.
