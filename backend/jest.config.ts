import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// Path aliases live in tsconfig.json — read from there to avoid duplication.
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);
const paths = tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',

  // ESM mode: diperlukan karena @nestjs/* v12 adalah pure ESM
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
        useESM: true,
      },
    ],
  },

  // node_modules @nestjs/* perlu ikut di-transform karena pure ESM
  transformIgnorePatterns: ['/node_modules/(?!(@nestjs)/)'],

  moduleNameMapper: {
    // Tangani ekstensi .js pada import ESM (TS pakai .js pada output)
    '^(\\.{1,2}/.*)\\.js$': '$1',
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  },

  // Setup file yang me-assign jest ke globalThis agar spec lama
  // yang belum menggunakan `import { jest } from '@jest/globals'` tetap berjalan.
  setupFilesAfterEnv: ['<rootDir>/test/jest-esm-setup.ts'],

  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
