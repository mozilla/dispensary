const path = require('path');
const fs = require('fs');

// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');

const nodeModules = {};

// This is to filter out node_modules as we don't want them
// to be made part of any bundles.
fs.readdirSync('node_modules')
  .filter((x) => {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'dispensary.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        exclude: /(node_modules|bower_components)/,
        test: /\.js$/,
        // babel options are in .babelrc
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.txt$/,
        use: [{ loader: 'raw-loader' }],
      },
    ],
  },
  externals: nodeModules,
  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  ],
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'src'],
  },
  devtool: 'source-map',
};
