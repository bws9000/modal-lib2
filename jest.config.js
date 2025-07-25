module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['./setup-jest.ts'],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: ['node_modules/(?!@angular|rxjs|tslib)'],
    modulePathIgnorePatterns: ['./dist']
};
