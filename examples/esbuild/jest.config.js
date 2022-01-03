/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'safetest.ts',
    'safetest.tsx',
    'json',
  ],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
};
