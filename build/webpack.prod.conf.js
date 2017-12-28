// 下面是引入nodejs的路径模块
var path = require('path')
// 下面是utils工具配置文件，主要用来处理css类文件的loader
var utils = require('./utils')
// 下面引入webpack，来使用webpack内置插件
var webpack = require('webpack')
// 下面是config目录下的index.js配置文件，主要用来定义了生产和开发环境的相关基础配置
var config = require('../config')
// 下面是webpack的merger插件，主要用来处理配置对象合并的，可以将一个大的配置对象拆分成几个小的，合并，相同的项将覆盖
var merge = require('webpack-merge')
// 下面是webpack.base.conf.js配置文件，我其他博客文章已经解释过了，用来处理不同类型文件的loader
var baseWebpackConfig = require('./webpack.base.conf')
// copy-webpack-plugin使用来复制文件或者文件夹到指定的目录的
var CopyWebpackPlugin = require('copy-webpack-plugin')
// html-webpack-plugin是生成html文件，可以设置模板，之前的文章将过了
var HtmlWebpackPlugin = require('html-webpack-plugin')
// extract-text-webpack-plugin这个插件是用来将bundle中的css等文件产出单独的bundle文件的，之前也详细讲过
var ExtractTextPlugin = require('extract-text-webpack-plugin')
// optimize-css-assets-webpack-plugin插件的作用是压缩css代码的，还能去掉extract-text-webpack-plugin插件抽离文件产生的重复代码，因为同一个css可能在多个模块中出现所以会导致重复代码，换句话说这两个插件是两兄弟
// 详情见(1)
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

// 如果当前环境变量NODE_ENV的值是testing，则导入 test.env.js配置文，设置env为"testing"
// 如果当前环境变量NODE_ENV的值不是testing，则设置env为"production"
var env = process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : config.build.env

// 把当前的配置对象和基础的配置对象合并
var webpackConfig = merge(baseWebpackConfig, {
    module: {
        // 下面就是把utils配置好的处理各种css类型的配置拿过来，和dev设置一样，就是这里多了个extract: true，此项是自定义项，设置为true表示，生成独立的文件
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    // devtool开发工具，用来生成个sourcemap方便调试
    // 按理说这里不用生成sourcemap多次一举，这里生成了source-map类型的map文件，只用于生产环境
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        // 打包后的文件放在dist目录里面
        path: config.build.assetsRoot,
        // 文件名称使用 static/js/[name].[chunkhash].js, 其中name就是main,chunkhash就是模块的hash值，用于浏览器缓存的
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        // chunkFilename是非入口模块文件，也就是说filename文件中引用了chunckFilename
        chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        // 下面是利用DefinePlugin插件，定义process.env环境变量为env
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new webpack.optimize.UglifyJsPlugin({
            // UglifyJsPlugin插件是专门用来压缩js文件的
            compress: {
                warnings: false // 禁止压缩时候的警告信息，给用户一种vue高大上没有错误的感觉
            },
            // 压缩后生成map文件
            sourceMap: true
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            // 生成独立的css文件，下面是生成独立css文件的名称
            filename: utils.assetsPath('css/[name].[contenthash].css')
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            // 压缩css文件
            cssProcessorOptions: {
                safe: true
            }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        // 生成html页面
        new HtmlWebpackPlugin({
            //非测试环境生成index.html
            filename: process.env.NODE_ENV === 'testing'
                ? 'index.html'
                : config.build.index,
            // 模板是index.html加不加无所谓
            template: 'index.html',
            // 将js文件放到body标签的结尾
            inject: true,

            minify: {
                // 压缩产出后的html页面
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            // 分类要插到html页面的模块
            chunksSortMode: 'dependency'
        }),


        // split vendor js into its own file
        // 下面的插件是将打包后的文件中的第三方库文件抽取出来，便于浏览器缓存，提高程序的运行速度
        new webpack.optimize.CommonsChunkPlugin({
            // common 模块的名称
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                // 将所有依赖于node_modules下面文件打包到vendor中
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        // 把webpack的runtime代码和module manifest代码提取到manifest文件中，防止修改了代码但是没有修改第三方库文件导致第三方库文件也打包的问题
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        // copy custom static assets
        // 下面是复制文件的插件，我认为在这里并不是起到复制文件的作用，而是过滤掉打包过程中产生的以.开头的文件
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ])
    ]
})

if (config.build.productionGzip) {
    // 开启Gzi压缩打包后的文件，老铁们知道这个为什么还能压缩吗？？，就跟你打包压缩包一样，把这个压缩包给浏览器，浏览器自动解压的
    // 你要知道，vue-cli默认将这个神奇的功能禁用掉的，理由是Surge 和 Netlify 静态主机默认帮你把上传的文件gzip了
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp( // 这里是把js和css文件压缩
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    // 打包编译后的文件打印出详细的文件信息，vue-cli默认把这个禁用了，个人觉得还是有点用的，可以自行配置
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig