const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Optimize chunks
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          moduleIds: 'deterministic',
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // Vendor chunk for node_modules
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
                reuseExistingChunk: true,
              },
              // Separate chunk for large libraries
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                name: 'react-vendor',
                priority: 20,
              },
              // UI library chunk
              ui: {
                test: /[\\/]node_modules[\\/](flowbite-react|react-bootstrap)[\\/]/,
                name: 'ui-vendor',
                priority: 15,
              },
              // Common chunk for shared code
              common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
        };

        // Add compression plugin
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          })
        );
      }

      // Remove console.logs in production
      if (env === 'production') {
        webpackConfig.optimization.minimizer[0].options.terserOptions = {
          ...webpackConfig.optimization.minimizer[0].options.terserOptions,
          compress: {
            ...webpackConfig.optimization.minimizer[0].options.terserOptions.compress,
            drop_console: true,
            drop_debugger: true,
          },
        };
      }

      return webpackConfig;
    },
  },
};

