module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      { useESM: true }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  modulePathIgnorePatterns: ['.dist/', '.src/tests/helpers/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node']
}
