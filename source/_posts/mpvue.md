---
title: 初探微信小程序——mpvue踩坑总结
tags:
  - share
categories: share
date: 2018-08-04 12:18:04
---

<img src="./wechat.png" width="400px">

&emsp;&emsp;前段时间，在第一次接触小程序开发的项目中，使用了美团的小程序框架mpvue。本文旨在给大家分享一些，自己在第一次接触小程序开发时遇到的一些常见需求的解决办法，以及在使用mpvue框架时踩过的坑，希望能帮助到大家。

<!-- more -->

小程序常见需求
===========

## 登录

>常用参数
>&emsp;&emsp;code：调用wx.login() 获取的用户登录凭证（有效期5min）
>&emsp;&emsp;session_key：会话密钥
>&emsp;&emsp;openid：用户唯一标识
>&emsp;&emsp;unionid：用户在开放平台的唯一标识符

### 普通登录

1. 小程序客户端调用wx.login()获取code。
2. 发送code至开发者服务端，开发者后端调用[微信服务端接口](https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code "获取openid，session_key（后端调用）")获取openid、session_key(在满足一定[条件](https://developers.weixin.qq.com/miniprogram/dev/api/unionID.html "UnionID机制说明")下还会返回UnionID)。
3. 开发者服务端自定义登录状态，返回小程序客户端一个token，当做用户的登录状态。
4. 小程序客户端存储token，在后续的业务请求接口中携带token，作用类似于web中的cookie。

### 绑定手机号登录

&emsp;&emsp;绑定手机号登录其实就是将用户手机号和用户的openid绑定起来存入数据库，其实登录流程也是和普通的登录流程一样，唯一的区别就是，第一次绑定的时候，需要首先让用户授权获取手机号。

## 微信授权用户手机号

&emsp;&emsp;相对于用户头像昵称来说，用户手机号是一个更隐私的用户信息，所以手机号的授权操作会繁琐一些，并且需要后端的支持。`getPhoneNumber(OBJECT)`需要用户主动触发才能发起获取手机号接口，所以该功能不由API来调用，需用`<button>`组件的点击来触发。
1. 小程序客户端调用wx.login()获取code。
2. 设置`<button>`组件`open-type`的值设置为`getPhoneNumber`，用户点击并同意授权后，通过`bindgetphonenumber`事件回调获取到微信服务器返回的加密数据。
3. 小程序客户端将加密数据和code一同发送给开发者服务器端。
4. 开发者服务端将，根据code获取openid，和通过加密数据、以及微信提供的[加密数据解密算法](https://developers.weixin.qq.com/miniprogram/dev/api/signature.html#wxchecksessionobject "加密数据解密算法")得到的用户手机号绑定在一起插入数据库。

注意：目前该接口针对非个人开发者，且完成了认证的小程序开放。需谨慎使用，若用户举报较多或被发现在不必要场景下使用，微信有权永久回收该小程序的该接口权限。

## 微信授权用户信息

&emsp;&emsp;微信小程序可以通过调用`wx.getUserInfo(OBJECT)`来获取用户头像，昵称等基本的微信账号信息。这个功能很常见，一般是用于展示用户的微信头像和昵称。
&emsp;&emsp;但有一点要注意的就是，今年4、5月份左右，微信更新了api，小程序不支出直接引导用户授权用户信息了。也就是说，如果用户没有授权过用户信息的话，直接调用`wx.getUserInfo()`将不会再弹出上面👆的这个授权弹窗了。微信推荐的方法是，设置`<button>`组件的`open-type`属性为`getUserinfo`，引导用户主动的点击按钮来进行授权操作。
&emsp;&emsp;这个变化目前对已发布的小程序暂时没有影响，但是【开发版】和【体验版】小程序，已经有了限制。__`所以，如果小程序需要授权用户基本信息，在设计时，需要设计一个用户按钮点击的交互。`__

## 下拉刷新、上拉加载

>小程序自带下拉刷新：
&emsp;&emsp;在页面json配置中开启`enablePullDownRefresh`选项
然后在函数`onPullDownRefresh()`中监听用户下拉刷新事件，处理完刷新数据后再用`wx.stopPullDownRefresh()`停止当前页面的下拉刷新。

>scroll-view下拉刷新
&emsp;&emsp;但是如果当前页面使用了`scroll-view`组件，这种自带的下拉刷新是不能用的。这种情况下就只能通过监听`scroll-view`组件的`bindscroll、以及bindtouchend、bindtouchstart`等事件来手动实现下拉刷新。

## 微信分享（群/私聊）

&emsp;&emsp;分享功能应该可以说是每款小程序比不可少功能了，小程序支持分享到聊天回话，不支持直接分享到朋友圈。小程序的分享有几个特点：页面可配置、文字/图片可配置、可携带参数。

&emsp;&emsp;首先，设置`<button>`组件的`open-type`属性为`share`
```html
    <button open-type="share">分享转发</button>
```
&emsp;&emsp;然后通过`onShareAppMessage(Object)`事件来监听用户点击转发按钮的事件，并自定义转发的内容。（如果当前页面没有定义此事件，则点击后无效果）
```js
    Page({
        onShareAppMessage: function (res) {
            if (res.from === 'button') {
                // 来自页面内转发按钮 button || menu
                return {
                    title: '自定义转发标题',
                    path: '/page/sharepage?id=123',
                    imageUrl: 'xxx.png'
                }
            }else {
                return {
                    title: '自定义转发标题',
                    path: '/page/sharepage?id=123',
                    imageUrl: 'xxx.png',
                    success: res => {
                        console.log('转发成功~')
                    },
                    fail: error => {
                        console.log('转发失败', error)
                    }
                }
            }
        }
    })
```
&emsp;&emsp;我们看到分享时，可以传入参数自定义分享卡片的标题，图片以及从卡片进入时跳转的页面路径。在官方文档上没有看到有写关于分享成功或者失败的回调，但我试了一下，是有的，可能是文档上漏了。这两个回调可以帮助我们在分享操作结束后，根据分享结果做一些不同的操作和处理。

&emsp;&emsp;其次，通过设置 `withShareTicket` 可以获取更多转发信息。在群聊中打开分享卡片时，可以取到`shareTicket`，通过调用 `wx.getShareInfo()` 接口，传入 `shareTicket` 可以获取到转发信息。
```js
    // ps: 如果设置了withShareTicket: true，在聊天对话中，长按分享发片是不可以直接二次转发的。
    wx.showShareMenu({
        withShareTicket: true
    })
```

&emsp;&emsp;但是如果遇到一个需求，要让你区别是分享到群还是分享到私聊回话，怎么办呢？其实，在分享的这一步，是没办法判断用户到底分享给谁的，所以只能在进入小程序的时候，根据场景值来判断了。

## 场景值

&emsp;&emsp;[场景值](https://developers.weixin.qq.com/miniprogram/en/dev/framework/app-service/scene.html?search-key=%E5%9C%BA%E6%99%AF%E5%80%BC "小程序场景值")可以用来判断小程序是从哪个场景下被打开的。场景值可以在 App 的 `onlaunch` 和 `onshow` 中获取到。根据不同的场景值，可以知道用户是从群聊还是私聊对话中进入小程序，从而可以做一些不同的逻辑处理。

## 小程序二维码生成

&emsp;&emsp;小程序二维码的生成官方提供了三种[接口](https://developers.weixin.qq.com/miniprogram/dev/api/qrcode.html?search-key=%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%A0%81)，分别有不同的特点，可以根据需求来选择接口。官方的描述是：
> A接口:生成小程序码，可接受path参数较长，生成个数受限。
> B接口:生成小程序码，可接受页面参数较短，生成个数不受限。
> C接口:生成二维码，可接受path参数较长，生成个数受限。

&emsp;&emsp;生成二维码的操作一般是开发者服务端来完成的，微信官方推荐生成并使用小程序码，而其中B接口又是最常用的，因为B接口生成的小程序码永久有效且不限制个数。
&emsp;&emsp;需要注意的几点:
+ B接口的路径不携带参数，参数都需要放在 `scene` 字段里，在 `onLoad()` 中可以获取到二维码中的 `scene` 字段的值
+ `page` 参数指定的路径必须是已经发布的小程序存在的页面，否则报错
+ 调试阶段可以使用开发工具的条件编译自定义参数 `scene=xxxx` 进行模拟

<img src="./compile-mode.jpg" width="600px">

## 其他小问题

### tabBar
如果使用小程序提供的自带的tab栏，根据官方文档进行配置即可，tab栏的页面配置最少2个、最多5个。
>唯一需要注意的一点是：小程序的首页必须配置在这几个tab栏中，否则就不能使用官方的tabBar，而只能手写tabBar，这点在设计的时候需要注意一下。

关于手动实现tabBar，遇到了一个问题，就是在切换tab标签时，会用 `wx.redirectTo()` 进行整个page页面之间的跳转，有的时候底部的tab栏就会出现闪烁的问题，暂时没想到更好的方案。

### 图片/字体的引用

&emsp;&emsp;由于小程序代码包大小上限是2M，所以建议不要引用本地图片字体，全部改成引用网络资源，也不要静态资源打包到小程序的代码包里。

### WXSS

+ WXSS中background-image只支持网络图片，或者base64格式的图片。

+ 新增了尺寸单位rpx，开发者不需要考虑设配问题，全都交给小程序底层来换算。

+ WXSS不再支持媒体查询，通过 `wx.getSystemInfo()` 来获取设备信息。

mpvue
=====
<br>[mpvue](http://mpvue.com/mpvue/) 继承自 `Vue.js`，其技术规范和语法特点与 `Vue.js` 保持一致。

## 开始项目

1. 新建项目模板
```js
    // 创建一个基于 mpvue-quickstart 模板的新项目
    vue init mpvue/mpvue-quickstart my-project
    npm install
    npm run dev
```
2. 微信开发者工具中选择项目dist目录

## 踩坑总结

+ 新建pages后，需要重新 npm run dev 一下。

+ mpvue 中使用 vuex: 
```js
    Vue.prototype.$store = store
```

+ 不支持vue-router

+ 在引用子组件时，不支持在组件上定义v-show，只能使用v-if替代。

+ 不支持组件上定义class，style等样式属性，建议写在内部顶级元素上。

+ 小程序在 `page` `onLoad` 时传递的 `options` , 可以在所有页面的组件内通过 `this.$root.$mp.query` 获取到。

+ 小程序在 `app` `onLaunch/onShow` 时传递的 `options` , 可以在所有页面的组件内通过 `this.$root.$mp.appOptions` 获取到。

+ 不支持transition过渡

+ 设置横向滑动：
>设置横向滑动 scroll-x="true";
>scroll-view需要设置宽度，并且设置white-space属性为nowrap;
>item设置display: inline-block属性;

+ 引用网络字体文件时，开发工具上可以支持http、但真机上只能引用https文件。

+ 定义vue组件名时需要注意，[一些保留关键字](http://mpvue.com/qa/#_3)，暂不支持作为组件名称。（自定义tabbar时遇到的大坑！！！）
