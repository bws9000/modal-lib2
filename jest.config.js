// module.exports = {
//     preset: 'jest-preset-angular',
//     setupFilesAfterEnv: ['./setup-jest.ts'],
//     testEnvironment: 'jsdom',
//     transformIgnorePatterns: ['node_modules/(?!@angular|rxjs|tslib)'],
//     modulePathIgnorePatterns: ['./dist']
// };
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json' }
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

