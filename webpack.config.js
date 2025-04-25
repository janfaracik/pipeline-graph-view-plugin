const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const wrapWithDefaultModule = (config) => {
  return {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'
              ]
            }
          }
        },
        {
          test: /\.scss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx'],
    },
    ...config
  }
}

module.exports = [
  wrapWithDefaultModule({
    entry: './src/main/frontend/pipeline-console-view',
    output: {
      path: path.resolve(__dirname, 'src/main/webapp/js/bundles'),
      filename: 'pipeline-console-view-bundle.js',
    },
    plugins: [
      ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin({analyzerPort: 8080,
        // pick another port if 8888 is busy
      })] : []),
    ],
  }),
  wrapWithDefaultModule({
    entry: './src/main/frontend/pipeline-graph-view',
    output: {
      path: path.resolve(__dirname, 'src/main/webapp/js/bundles'),
      filename: 'pipeline-graph-view-bundle.js',
    },
  }),
  wrapWithDefaultModule({
    entry: './src/main/frontend/multi-pipeline-graph-view',
    output: {
      path: path.resolve(__dirname, 'src/main/webapp/js/bundles'),
      filename: 'multi-pipeline-graph-view-bundle.js',
    },
  }),
];
