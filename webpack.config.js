module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    publicPath: '/',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  externals: [
    'bson',
    'sift',
    'bluebird'
  ]
};
