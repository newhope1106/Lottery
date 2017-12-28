// 导入check-versions.js文件，并且执行导入的函数，用来确定当前环境node和npm版本是否符合要求
// 关于check-versions请查看我博客check-versions的相关文章
require('./check-versions')()
// 导入config目录下的index.js配置文件，此配置文件中定义了生产和开发环境中所要用到的一些参数
// 关于index.js的文件解释请看我博客的index.js的相关文章
var config = require('../config')
// 下面表示如果如果没有定义全局变量NODE_ENV，则将NODE_ENV设置为"development"
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
// opn插件是用来打开特定终端的，此文件用来在默认浏览器中打开链接 opn(url)
var opn = require('opn')
// nodejs路径模块
var path = require('path')
// nodejs开发框架express，用来简化操作，有兴趣可以自行去了解
var express = require('express')
// 引入webpack模块，用来使用webpack内置插件
var webpack = require('webpack')
// 引入http-proxy-middleware插件，此插件是用来代理请求的只能用于开发环境，目的主要是解决跨域请求后台api
var proxyMiddleware = require('http-proxy-middleware')
// 下面的意思是指，如果不是testing环境就引入webpack.dev.conf.js配置文件
// 关于webpack.dev.conf.js配置文件请关注我的相关文章，建议现在就去看，否则后面看着吃力
var webpackConfig = process.env.NODE_ENV === 'testing' ?
    require('./webpack.prod.conf') :
    require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
// 下面是webpack-dev-server 监听的端口号，因为没有设置process.env.PORT，所以下面监听的就是config.dev.port即8080
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
// 下面是true,至于为啥，本来就是true还要加!!两个感叹号，估计是vue作者装了个逼吧
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
// 下面是解决开发环境跨域问题的插件，我在config目录index.js文章中有介绍，自行查看
var proxyTable = config.dev.proxyTable
// 下面是创建node.js的express开发框架的实例，别问我为什么这样，自己看node.js去吧
var app = express()
// 把配置参数传递到webpack方法中，返回一个编译对象，这个编译对象上面有很多属性，自己去看吧，主要是用到里面的状态函数 如compilation，compile，after-emit这类的
var compiler = webpack(webpackConfig)
// 下面是webpack-dev-middleware和webpack-hot-middleware两兄弟，这两个是黄金组合
// 而vue作者用这两个插件也是用的最基本的形式，详情看(1) (2)
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true  // 使用friendly-errors-webpack-plugin插件这个必须设置为true，具体看我的wepback-dev-config.js
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {} // 使用friendly-errors-webpack-plugin插件这个必须设置为true，具体看我的wepback-dev-config.js
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    // webpack任何一个插件都plugin这个方法，里面可以传递钩子函数，用来在插件各个阶段做特殊处理，钩子函数种类很多
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        // 当插件html-webpack-plugin产出完成之后，强制刷新浏览器
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })
})

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
    // 下面是代理表的处理方法，看看就行了，几乎用不上，除非你是全栈，不用webpack-dev-server，使用后台语言做服务器
    var options = proxyTable[context]
    if (typeof options === 'string') {
        options = { target: options }
    }
    app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
// 这个插件是用来解决单页面应用，点击刷新按钮和通过其他search值定位页面的404错误
// 详情请看(3)
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
// app.use是在响应请求之前执行的，用来指定静态路径，挂载静态资源
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
// 下面的staticPath是 static ，path.posix.join其他配置文件中我已经介绍了，这里不再赘述
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
// 挂载静态资源，下面的方法是用虚拟目录来访问资源，staticPath就是虚拟目录路径，其实不管设不设置都是static
app.use(staticPath, express.static('./static'))
// 下面结果就是 'http://localhost:8080'
var uri = 'http://localhost:' + port

// 下面是es6的promise规范，用来处理嵌套请求的
var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve // resolve是一个回调函数专门用来传递成功请求的数据
})
// 下面是加载动画
console.log('> Starting dev server...')
// waitUntilValid是webpack-dev-middleware实例的方法，在编译成功之后调用
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    // 测试环境不打开浏览器
    if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        opn(uri)
    }
    _resolve() // 这里没有传递数据，这只是在模拟
})
// node.js监听端口
var server = app.listen(port)
// 这个导出对象是用来对外提供操作服务器和接受数据的接口，vue作者可谓考虑颇深啊
module.exports = {
    ready: readyPromise, // promise实例，可以通过readyPromise.then收到数据
    close: () => {
        server.close() // 关闭服务器
    }
}