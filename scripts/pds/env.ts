import dotenv from 'dotenv';

export interface PdsEnv {
  service: string;
  identifier: string;
  password: string;
  buildHook?: string;
}

export function parseEnv(
  raw: Record<string, string | undefined>,
  opts: { requireBuildHook?: boolean } = {},
): PdsEnv {
  const required = ['PDS_SERVICE', 'PDS_IDENTIFIER', 'PDS_APP_PASSWORD'];
  if (opts.requireBuildHook) required.push('NETLIFY_BUILD_HOOK');

  const missing = required.filter((key) => !raw[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  return {
    service: raw.PDS_SERVICE!,
    identifier: raw.PDS_IDENTIFIER!,
    password: raw.PDS_APP_PASSWORD!,
    buildHook: raw.NETLIFY_BUILD_HOOK || undefined,
  };
}

export function loadEnv(opts: { requireBuildHook?: boolean } = {}): PdsEnv {
  dotenv.config();
  return parseEnv(process.env, opts);
}
