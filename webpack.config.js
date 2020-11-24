const path = require('path');
const { HotModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

const NODE_ENV = process.env.NODE_ENV || 'development';

const common = {
  mode: NODE_ENV,
  entry: {
    main: path.resolve(__dirname, 'src/main.ts'),
    worker: {
      import: './src/emojipad/worker.ts',
      filename: 'scripts/worker.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/[name].[contenthash].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: { configFile: path.resolve(__dirname, 'tsconfig.json') }
        },
      },
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { configFile: path.resolve(__dirname, 'src/emojipad/tsconfig.json') }
          },
        ],
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
      template: '!!ejs-webpack-loader!src/templates/index.ejs',
      filename: 'index.html',
      excludeChunks: ['worker'],
    }),
    new HtmlWebpackPlugin({
      publicPath: '/',
      template: '!!ejs-webpack-loader!src/templates/article.ejs',
      filename: 'article.html',
      excludeChunks: ['worker'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        },
      ],
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
