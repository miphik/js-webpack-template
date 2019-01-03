const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');
const fs = require('fs');

const NODE_ENV = process.env.NODE_ENV || 'prod';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const PATHS = {
    source: resolveApp('src'),
    build:  resolveApp('build'),
    public: resolveApp('public'),
};

module.exports = {
    mode:   'development',
    target: 'electron-renderer',
    entry:  {
        index: (
                   NODE_ENV === 'dev' ? [
                       'react-dev-utils/webpackHotDevClient',
                   ] : []
        ).concat([`${PATHS.source}/index.js`]),
    },
    output: {
        path:          PATHS.build,
        filename:      './js/[name].js',
        pathinfo:      true,
        chunkFilename: 'static/js/[id].js',
        publicPath:    '/',
        // Point sourcemap entries to original disk location
        // devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
    },
    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We placed these paths second because we want `node_modules` to "win"
        // if there are any conflicts. This matches Node resolution mechanism.
        modules:    ['node_modules'],
        // JSX is not recommended, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        extensions: ['.js', '.json', '.jsx'],
        // Enable aliases to use utils as separate packages.
        // We might convert project to monorepo in the future.
        // https://github.com/lerna/lerna
        alias:      {
            components: path.resolve(__dirname, './../src/components'),
            pages:      path.resolve(__dirname, './../src/pages'),
            actions:    path.resolve(__dirname, './../src/actions'),
            utils:      path.resolve(__dirname, './../src/utils'),
            src:        path.resolve(__dirname, './../src'),
            // TODO REMOVE ONCE ISSUE IS FIXED: https://github.com/ant-design/ant-design/issues/12011
            // '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/icons.js'),
        },
        symlinks: false,
    },
    plugins: [
        new CleanWebpackPlugin([PATHS.build], {
            root:    resolveApp('/'),
            verbose: true,
            dry:     false,
            exclude: [],
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            __DEV__:  NODE_ENV === 'dev',
            // $:      'jquery',
            // jQuery: 'jquery',
        }),
        new HtmlWebpackPlugin({
            inject:         true,
            chunks:         ['index', 'common'],
            filename:       `${PATHS.build}/index.html`,
            template:       `${PATHS.public}/index.html`,
            chunksSortMode: 'none',
        }),
        /* new HtmlWebpackPlugin({
            filename: 'blog.html',
            chunks:   ['blog', 'common'],
            emplate:  PATHS.source + '/pages/blog/blog.pug',
        }),*/
        new CaseSensitivePathsPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                    minChunks: 2,
                    chunks:    'all',
                    name:      'common',
                    priority:  10,
                    enforce:   true,
                },
            },
        },
    },
    node: {
        __filename: true,
        __dirname:  true,
    },
};
