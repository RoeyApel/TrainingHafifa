import { describe, expect, it } from '@jest/globals';
import { NodeEnv } from '../../src/types/config/enums.js';
import { validateEnv } from '../../src/config/env.validation.js';

const REQUIRED_ENV = {
  DB_HOST: 'localhost',
  DB_USERNAME: 'user',
  DB_PASSWORD: 'password',
  DB_NAME: 'db',
  GEOSERVER_URL: 'http://localhost:8080/geoserver',
  GEOSERVER_USERNAME: 'admin',
  GEOSERVER_PASSWORD: 'password',
  GEOSERVER_WORKSPACE: 'workspace',
  GEOSERVER_NAMESPACE_URI: 'http://workspace',
};

describe('validateEnv', () => {
  it('applies defaults for optional variables', () => {
    const env = validateEnv(REQUIRED_ENV);

    expect(env.NODE_ENV).toBe(NodeEnv.Development);
    expect(env.PORT).toBe(3000);
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.DB_PORT).toBe(5434);
  });

  it('coerces numeric variables', () => {
    const env = validateEnv({ ...REQUIRED_ENV, PORT: '8080', DB_PORT: '6543' });

    expect(env.PORT).toBe(8080);
    expect(env.DB_PORT).toBe(6543);
  });

  it('rejects an invalid LOG_LEVEL', () => {
    expect(() => validateEnv({ ...REQUIRED_ENV, LOG_LEVEL: 'loud' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects a GEOSERVER_URL without a protocol', () => {
    expect(() =>
      validateEnv({ ...REQUIRED_ENV, GEOSERVER_URL: 'localhost:8080' }),
    ).toThrow(/GEOSERVER_URL/);
  });

  it.each(Object.keys(REQUIRED_ENV))('requires %s', (name) => {
    const env: Record<string, string> = { ...REQUIRED_ENV };
    delete env[name];

    expect(() => validateEnv(env)).toThrow(name);
  });
});
