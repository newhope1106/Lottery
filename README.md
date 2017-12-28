> 基于vue2的抽奖转盘项目

参考自:https://github.com/coffeedeveloper/turntable

#### 示例
![示例](./lottery.png)

## Structure

```
├── README.md
├── build
│   ├── build.js
│   ├── check-versions.js
│   ├── dev-client.js
│   ├── dev-server.js
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   ├── webpack.prod.conf.js
│   └── webpack.test.conf.js
├── config
│   ├── dev.env.js
│   ├── index.js
│   ├── prod.env.js
│   └── test.env.js
├── dist
│   ├── index.html
│   └── static
├── index.html
├── jsons
├── package.json
├── src
│   ├── assets
│   ├── components
│   ├── main.js
│   ├── util
│   └── views
├── static
└── test
    └── unit
```

## Development & Production

在根目录下安装模块、开发

    ``` bash
    # install dependencies
    npm i

    # serve with hot reload at localhost:port
    npm run dev

    # build for production with minification
    npm run build

    # build for production and view the bundle analyzer report
    npm run build --report
    ```

    Tips:

    如果 npm install 时出现失败的情况，例如 `PhantomJS not found on PATH` `npm ERR! node-sass@4.5.0 postinstall: node scripts/build.js` 等，大部分是由于国内网络限制的原因，可以用淘宝镜像来解决。你可以按 [npm.taobao.org](https://npm.taobao.org/) 的方法安装`cnpm`，或者通过 [npm config](https://docs.npmjs.com/files/npmrc) 文件解决：将如下加入 ~/.npmrc 文件

    ``` bash
    sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
    phantomjs_cdnurl=https://npm.taobao.org/mirrors/phantomjs/
    registry=https://registry.npm.taobao.org
    `
