const path = require('path');

module.exports = {
  mockExcludes: ['**/_smock/_data/**', '**/lib/**'],
  mockCwd: path.resolve(__dirname),
  mockDirs: [
    'packages/mock'
  ],
}
