import { describe, expect, it } from 'vitest';
import { parseEnv } from './env.ts';

const full = {
  PDS_SERVICE: 'https://pds.example',
  PDS_IDENTIFIER: 'alice.example',
  PDS_APP_PASSWORD: 'app-pass',
  NETLIFY_BUILD_HOOK: 'https://hook.example',
};

describe('parseEnv', () => {
  it('parses a full env', () => {
    expect(parseEnv(full)).toEqual({
      service: 'https://pds.example',
      identifier: 'alice.example',
      password: 'app-pass',
      buildHook: 'https://hook.example',
    });
  });

  it('throws listing every missing required var', () => {
    expect(() => parseEnv({})).toThrow(/PDS_SERVICE.*PDS_IDENTIFIER.*PDS_APP_PASSWORD/s);
  });

  it('build hook optional by default, required when asked', () => {
    const { buildHook } = parseEnv({ ...full, NETLIFY_BUILD_HOOK: undefined });
    expect(buildHook).toBeUndefined();
    expect(() =>
      parseEnv({ ...full, NETLIFY_BUILD_HOOK: undefined }, { requireBuildHook: true }),
    ).toThrow(/NETLIFY_BUILD_HOOK/);
  });
});
