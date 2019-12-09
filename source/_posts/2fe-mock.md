---
title: 前端数据Mock---Express + Mockjs
date: 2018-04-24 21:59:04
updated: 2018-5-18 11:46:36
tags:
  - technology share
categories: technology share #文章分类
---
<img src="./mock.jpg" width="600px">
前端开发中，数据mock是一个可大可小、可繁可简的开发流程，完整的前端数据mock最大的目的是旨在**降低前后端接口联调的成本**。
本文给大家分享自己在开发中的mock数据的方法，内容简单易懂，欢迎各位大佬批评指正。
<!-- more -->
---

前端数据模拟
==========
在前后端分离的开发模式中，前后端通常是先约定好接口的输入输出以及格式，然后各自按照接口格式来进行同步的开发，等后端接口实现完成，前端数据逻辑处理也完成后，再进行前后端联调。

所以当项目接口比较多，而且后端接口还未全部实现的时候，前端需要对接口数据进行模拟，以便编写前端的交互逻辑等功能性的代码。这个时候我们就需要尽可能全面地模拟接口数据的各种情况，这样的话，当后端接口全部实现后，可以降低前后端的联调成本。

MockJs
======
mockJs是一个可以模拟接口数据的插件，它可以很方便地模拟各种类型的接口数据，而且模拟的数据时可随机的。虽然这个库有不少的坑点（后面会讲）而且貌似已经很久没有维护了，但是仅仅用来做数据模拟还是挺方便的，首先，需要安装一下：

## 安装

```javascript
npm install mockjs --save-dev
```

## 简单用法
首先，新建一个`mock.js`文件，模拟一个简单的接口：

```javascript
let Mock = require('mockjs')
Mock.mock('//mock/base/getUserInfoFromPC', {
    'code': 200,
    'data': {
        'nickName': 'alexixiang',
        'id': 1707000766
    }
})
```

上面的代码就模拟了一个接口名为`/base/getUserInfoFromPC`的接口。我一般会在后端定义的真实接口前面加一个标志位，这里是加一个`mock`，目的是方便区分什么时候取自己模拟的数据，时候取后端真实接口的数据。

然后，在项目的请求封装的文件中添加下列代码：

```javascript
let mock = true // true
let baseURL = mock ? '//mock/' : `//activity.f***s.cn/`
```

在项目前后端独立开发阶段，设置`mock`为true，所有的请求都会以`//mock`开头，刚好和我们`mock.js`中设置的一一对应，mockjs会拦截到所有`//mock`开头的请求，并且返回它自己模拟的数据。等到前后端联调的时候，再设置为false，然后所有的请求就会按照真实的后端接口地址来发送请求。

## 随机数据
mockjs可以随机地模拟各类的数据，常用的包括日期时间、城市省份、姓名、颜色、关键字、email、句子段落、甚至可以按尺寸模拟图片、带文字的图片等等。这里就举一个简单例子，更多种类的数据可以查看官方文档。

```javascript
let data = Mock.mock({
    'code': 200,
    'message': 'success',
    'data': {
        'list|5-10': [{     // 随机返回一个包含5到10个对象的数组
            'num|0-100': 0, // 随机返回一个0到100的整数
            'name': function() { // 随机返回一个姓名
                return Mock.mock('@cname')
            },
            'date': function() { // 随机返回一个指定格式的日期
                return Mock.Random.date('yyyy-MM-dd')
            }
        }],
        'img': Mock.Random.image('450x400', '#50B347', '#FFF', 'Hello!Mock.js!')
        // 返回指定尺寸、颜色和文字的一张图
    }
})
```

mockjs在模拟数据这一块非常的方便，甚至有时候mockjs模拟的数据比联调的时候，后端在开发环境数据库里模拟的数据更全面、情况更多。前端在拿到接口格式后，可以独立于后端进行开发，并且前后端的开发进度基本上不会相互影响，联调成本也会大大降低。但是在实际的应用中，我还是发现mockjs存在一些坑点，毕竟这个库的GitHub上issues还是挺多的。

## 坑点1：get请求不能传参
mockjs只会拦截你的请求，但不会对你请求发送的参数进行任何验证处理等。所以在模拟post请求数据时，我可以按照真实接口的请求方式，把请求的参数完整的写在代码里，因为无论发送什么参数，数据都会按照mock的格式正确返回。

但是，我在模拟get请求的时候，如果携带上接口需要的参数，get请求会将参数加载请求的url后面。例如，我在`mock.js`中设置的接口是`//mock/base/getSomeData`,然后发送get请求并携带参数后，真实地址变成了`//mock/base/getSomeData?userId=12345`。这个时候我发现mockjs就没办法正确的返回mock数据了，我查阅了mockjs文档，有看到关于get请求的模拟，但是尝试之后发现任然没用，所以我就只能在封装get请求的时候，判断一下当前状态是mock状态还是非mock状态，如果是mock状态就不携带参数，虽然方法有点笨，但也算是解决了这个问题，并且在联调的时候，不需要修改业务逻辑层的代码。如下：

```javascript
let mock = true // false
let baseURL = mock ? '//mock/' : `//activity.f***s.cn/`
export default {
    get(url, params) {
        return Axios({
            url: url,
            method: 'get',
            baseURL: baseURL,
            params: mock ? {} : params,
            withCredentials: true
        })
    }
    ......
}
```

## 坑点2：无法携带cookie
这个坑就厉害了，曾经整整折磨了我一个下午。。。。。。

前不久，在开发一个后台管理项目的时候，后端写好了一个用户信息验证接口准备和我一起调试一下，这个接口需要携带cookie。我就从mock模式切换到非mock模式，仅仅修改了封装请求的js文件中的`let mock = false`，然后我就天真地以为，可以顺利的调试正式接口了。但我发现我前端请求头设置了`withCredentials: true`，后端响应头也设置了`'Access-Control-Allow-Credentials', 'true'`，但是发送的请求就是死活携带不上cookie 🙂我和隔壁组两个前端，三个人花了大半个下午的时间，最后发现是引用了mockjs模块的原因。后来去GitHub上搜了mockjs的源码，搜索出来这么一行。

![mockjs](fe-mock/withCredentials.jpg)

然后我当时就心里MMP了🙂。。。
它拦截了我的请求，并且修改了`withCredentials`，所以cookie携带不上。我的所以下次“切换非mock模式”的时候，还需要注释掉`require('mockjs)`，也算是吃一堑长一智吧。

Express+Mockjs
==============
express是一个基于Node.js平台的web开发框架。
mockjs模拟数据固然很方便，但它仅仅使用来模拟接口数据的，如果想把前端数据mock的过程更真实，更接近正式的请求，那可以结合express来起一个后端服务器，模拟整个请求的发送接收过程。

## 安装
新建一个mock服务端的小demo，安装mockjs和express：

```javascript
npm install express mockjs --save-dev
```

## 搭建服务
新建一个`server.js`文件:

```javascript
let express = require('express')
let app = express()

app.all('/api/demo', (req, res) => {
    res.send('Mock!! This is MockData!!')
})
let server = app.listen(9999, () => {
    let port = server.address().port
    console.log('server running successful...')
    console.log(`server listening at http://localhost:${port}`)
})
```

运行`node server.js`把服务跑起来后，浏览器打开`http://localhost:9999/api/demo`，可以看到`Mock!! This is MockData!!`。

## 引入mockjs
修改`server.js`文件，把前面介绍的mockjs模拟的数据，并放到response中:

```javascript
let express = require('express')
let Mock = require('mockjs')
let app = express()

app.all('/api/demo', (req, res) => {
    let data = Mock.mock({
        'code': 200,
        'message': 'success',
        'data': {
            'list|5-10': [{     // 随机返回一个包含5到10个对象的数组
                'num|0-100': 0, // 随机返回一个0到100的整数
                'name': function() { // 随机返回一个姓名
                    return Mock.mock('@cname')
                },
                'date': function() { // 随机返回一个指定格式的日期
                    return Mock.Random.date('yyyy-MM-dd')
                }
            }],
            'img': Mock.Random.image('450x400', '#50B347', '#FFF', 'Hello!Mock.js!')
            // 返回指定尺寸、颜色和文字的一张图
        }
    })
    res.json(data)
})
let server = app.listen(9999, () => {
    let port = server.address().port
    console.log('server running successfully...')
    console.log(`server listening at http://localhost:${port}`)
})
```

浏览器访问`http://localhost:9999/api/demo`后可以看到相应的模拟数据。

## 修改前端请求封装
有了前面的思路，我们修改前端项目封装请求的文件：

```javascript
let mock = true // true
let baseURL = mock ? '//localhost:9999/' : `//activity.f***s.cn/`
```

即在“mock模式下”，前端的请求全都去请求本地的`9999`端口的服务。

## 完善mock服务端
然后，我们再把mock服务端项目完善一下。为了方便和后端的正式接口一一对应，我在mock服务端项目新建一个mockApi文件夹，并在里面按照正式接口的名称层级，创建每个接口对应的mock文件。例如，有个名称为`/base/getUserInfoFromPC`的接口，就在`./mockApi/base`目录下新建getUserInfoFromPC.js文件，添加如下代码：

```javascript
let Mock = require('mockjs')
let data = function () {
    return Mock.mock({
        'code': 200,
        'data': {
            'nickName': 'alexixiang',
            'id': 1707000766
        }
    })
}
module.exports = data
```

然后修改server.js文件：

```javascript
let express = require('express')
let app = express()
let baseRoot = './mockApi' // mock数据文件夹路径
app.post('/base/getUserInfoFromPC', (req, res) => {
    res.json(require(`${baseRoot}/base/getUserInfoFromPC.js`)())
})
let server = app.listen(9999, () => {
    let port = server.address().port
    console.log('server running successfully...')
    console.log(`server listening at http://localhost:${port}`)
})
```

然后在开发中，本地需要跑两个服务，一个是mock服务端，另一个是本地的前端页面。通常两个服务的端口不一样，存在跨域问题，所以还需要在`server.js`中添加配置跨域，如果需要携带cookie还需要设置`'Access-Control-Allow-Credentials', 'true'`:

```javascript
// 中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
})
```

至此，利用express和mockjs搭建的mock服务端就基本完成了。我觉得这种方法相比于第一种方法好处有以下几点：
+ 前面讲到的两个坑点，不会再出现了。
+ mock代码都在mock服务端写，前端项目不写mock相关代码。把前端项目的业务逻辑、接口请求和mock数据的代码独立开来，不会相互影响。
+ 而且在mock服务端还可以对请求的传参进行一些简单的判断和处理等，从而让整个mock数据的过程更接近正式联调接口的状态。

总结
===
前端数据mock本身是一个可大可小、可繁可简的开发流程。但是在实际开发中，一个新的项目通常都是前后端同时进行开发，为了降低前后端接口联调的成本，提高联调效率，完善前端mock数据和mock接口请求的过程是很有必要的。
前端mock的方法就简单介绍到这里，欢迎各位大佬批评指正。

参考文献
======
+ mock：http://mockjs.com/
+ express：http://www.expressjs.com.cn/
