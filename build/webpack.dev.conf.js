// 引入当前目录中的utils工具配置文件
// 请自行查看我博客中的utils.js的相关文章
var utils = require('./utils')
// 引入webpack来使用webpack内置插件
var webpack = require('webpack')
// 引入config目录中的index.js配置文件
var config = require('../config')
// 引入webpack-merge插件用来合并webpack配置对象，也就是说可以把webpack配置文件拆分成几个小的模块，然后合并
var merge = require('webpack-merge')
// 引入当前目录下的webpack.base.conf.js配置文件，主要配置的是打包各种文件类型的配置
// 请自行查看我博客的相关文章
var baseWebpackConfig = require('./webpack.base.conf')
// 下面是一个自动生成html的插件，能够把资源自动加载到html文件中
// 详情请看 (1)
var HtmlWebpackPlugin = require('html-webpack-plugin')
// 下面这个插件是用来把webpack的错误和日志收集起来，漂亮的展示给用户
// 详情请看 (2)
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
// Object.keys(obj) 是取对象的索引，并放在一个数组里面的方法
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    // 下面这个结果就是把webpack.base.conf.js中的入口entry改成如下配置
    // app: ['./build/dev-client','./src/main.js']
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})
// 下面是合并配置对象，将这个配置文件特有的配置添加替换到base配置文件中
module.exports = merge(baseWebpackConfig, {
    module: {
        // 下面是把utils配置中的处理css类似文件的处理方法拿过来，并且不生成cssMap文件
        rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
    },
    // cheap-module-eval-source-map is faster for development
    // debtool是开发工具选项，用来指定如何生成sourcemap文件，cheap-module-eval-source-map此款soucemap文件性价比最高
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        // DefinePlugin内置webpack插件，专门用来定义全局变量的，下面定义一个全局变量 process.env 并且值是如下
        /*  'process.env': {
                NODE_ENV: '"development"'
            } 这样的形式会被自动转为
            'process.env': '"development"'
            各位骚年看好了，development如果不加双引号就当做变量处理，程序会报错
        */
        new webpack.DefinePlugin({
            'process.env': config.dev.env
        }),
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        // 下面这个插件HotModuleReplacementPlugin可以说是博大精深没有几个人弄透的，包括我在内，
        // 详情见(3)
        new webpack.HotModuleReplacementPlugin(),
        // 下面这个插件比较简单，就是当webpack编译错误的时候，来中端打包进程，防止错误代码打包到文件中，你还不知道
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        // 下面这个插件介绍过了
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true  //-> 设置为true表示把所有的js文件都放在body标签的屁股
        }),
// 使用FriendlyErrorsPlugin插件，介绍过了，这个插件的其他细节还设置在dev-server-js文件中
new FriendlyErrorsPlugin()
]
})
