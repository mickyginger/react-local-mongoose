module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    publicPath: '/'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
};
