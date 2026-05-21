module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': {
        tsconfig: 'tsconfig.test.json'
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts'
  ]
}