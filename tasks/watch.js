module.exports = {
  tests: {
    files: [
      'src/**/*.js',
      'tests/**/*.js',
    ],
    tasks: [
      'test',
    ],
    options: {
      interrupt: true,
    },
  },
};
