// NestJS 12 is ESM-only, so Jest runs in native ESM mode
// (node --experimental-vm-modules, see package.json scripts).
// SWC compiles the specs because ts-jest/babel can't emit the decorator
// metadata that Nest's DI and class-validator rely on.

/** @type {import('@swc/core').Options} */
const swcOptions = {
  module: { type: 'es6' },
  jsc: {
    target: 'es2023',
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
  },
};

/** @type {import('jest').Config['projects'][number]} */
const shared = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: { '^.+\\.ts$': ['@swc/jest', swcOptions] },
  // Sources import siblings as './x.js' (nodenext); map them back to the .ts.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  clearMocks: true,
};

/** @type {import('jest').Config} */
export default {
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
    },
    {
      ...shared,
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
    },
  ],
};
