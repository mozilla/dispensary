module.exports = {
  js: {
    options: {
      config: '.jscsrc',
    },
    files: {
      src: [
        'tasks/**/*.js*',
        'tests/**/*.js*',
        '!tests/fixtures/**.js',
        '!tests/fixtures/test_libraries.json',
        'src/**/*.js',
        'Gruntfile.js',
        'webpack.config.js',
      ],
    },
  },
};
