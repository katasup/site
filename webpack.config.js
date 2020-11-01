const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { merge } = require('webpack-merge');

const NODE_ENV = process.env.NODE_ENV || 'development';

const common = {
  mode: NODE_ENV,
  entry: {
    main: path.resolve(__dirname, 'src/main.ts'),
    article: path.resolve(__dirname, 'src/article.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/[name].[contenthash].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/templates/index.html',
      filename: 'index.html',
      chunks: ['main'],

    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/article.html',
      filename: 'article.html',
      chunks: ['article'],
    }),
  ],
};

let config;

if (NODE_ENV === 'development') {
  config = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
      historyApiFallback: true,
      contentBase: path.resolve(__dirname, './dist'),
      open: true,
      // compress: true,
      hot: true,
      port: 8080,
    },
    plugins: [
      new HotModuleReplacementPlugin()
    ],
  });
}

if (NODE_ENV === 'production') {
  config = merge(common, {
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
        chunkFilename: '[id].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: false,
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [new OptimizeCssAssetsPlugin()],
      runtimeChunk: {
        name: 'runtime',
      },
      splitChunks: {
        chunks: 'all',
        minSize: 0,
      }
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  });
}

module.exports = config;
