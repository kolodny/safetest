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
    '^.+\\.tsx$': 'ts-jest',
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.safetest.tsx$': 'ts-jest',
    '^.+\\.safetest.ts$': 'ts-jest',
  },
};
