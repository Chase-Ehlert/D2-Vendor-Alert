module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '\\.[jt]sx?$': ['ts-jest', {useESM: true}]
    },
    moduleNameMapper: {
        '(.+)\\.js': '$1'
    },
    extensionsToTreatAsEsm: ['.ts'],
    modulePathIgnorePatterns: ['.dist/', '.src/tests/helpers/']
}
