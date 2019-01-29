var isparta = require('isparta');

module.exports = {
  files: {
    files: '**/*.js'
  },
  options: {
    lazy: true,
    cwd: 'src',
    basePath: 'coverage/',
    instrumenter: isparta.Instrumenter,
  },
};
