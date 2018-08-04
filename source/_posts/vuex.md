---
layout: photopost
title: VUEX学习笔记
date: 2018-03-07 17:24:37
categories: study notes #文章分类
tags: [study notes]
---
![Vuex](vuex/vuex.png)

vuex学习笔记

<!-- more -->

Vuex 简介
========
Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。我们可以利用vuex来管理多个组件的共享状态。

每一个 Vuex 应用的核心就是 store（仓库）。“store”基本上就是一个容器，它包含着你的应用中大部分的状态 (state)。Vuex 和单纯的全局对象有以下两点不同：

+ Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。

+ 你不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

安装
===
使用npm安装vuex
```
    npm install vuex --save-dev
```
简单用法
==========
首先，我们需要在src目录下新建一个store目录，用来对项目的各个状态进行管理。再store文件夹下新建一个index.js，作为整个项目状态管理的入口文件（就好比于route文件下的index.js）。然后在index.js中添加如下代码：
```js
    import Vue from 'vue'
    import vuex from 'vuex'
    Vue.use(vuex)

    const store = new vuex.Store({
        state: {
            hasLogin: false
        }
    })

    export default store
```
这样我们就定义好了一个简单的store，接下来需要在项目入口文件的Vue实例中载入这个store。修改main.js如下：
```js
    import Vue from 'vue'
    import App from './App'
    import store from './store'

    new Vue({
        el: '#app',
        store,
        components: { App },
        template: '<App/>'
    })
```
然后我们在页面上使用 `this.$store.state.hasLogin` 就可以获取到hasLogin这个状态。
但是在实际开发中，有时候这样简单的用法不能满足复杂的状态管理需求，所以我们需要进一步的学习Vuex的几个核心概念。

State
====
state可以理解成状态，它记录了整个项目的各个状态属性。Vuex使用单一状态树，简单的说，就是每个应用仅仅包含一个store实例。只要在根实例中注册了 store 选项，该 store 实例会注入到根组件下的所有子组件中，然后子组件就都可以通过 `this.$store` 访问到了。例如上面的代码中，在整个项目的vue组件中都可以使用`this.$store.state.hasLogin` 来获取hasLogin这个状态。在Vue组件中，通常使用计算属性返回某个状态，来获得Vuex状态。

Getter
======
有时候我们需要从store中的state中派生出一些状态，例如某个state的值是随着另个state的值的变化而变化的。这时候我们就需要用到getter，可以理解为 store 的计算属性。getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。
修改store文件夹下的index.js：
```js
    import Vue from 'vue'
    import vuex from 'vuex'
    Vue.use(vuex)
    const store = new vuex.Store({
        state: {
            userId: 123456,
            hasLogin: true
        },
        // 根据某个state计算一些跟它有关系的状态等
        getters: {
            defaultName(state) {
                return `user${state.userId}`
            },
            isVisitor(state) {
                return !state.hasLogin
            }
        }
    })
    export default store
```
像上面这样定义了两个getter之后，可以在任何组件中访问这些值：
```js
    this.$store.getters.defaultName // user123456
    this.$store.getters.isVisitor // false
```
一旦getter对象中的属性所依赖的state发生了变化，那对应的getter属性也会跟着变化

Mutation
========
mutation是用来修改Vuex的store中的状态state的，并且这是唯一的方法。在index.js中添加mutation:
```js
    import Vue from 'vue'
    import vuex from 'vuex'
    Vue.use(vuex)
    const store = new vuex.Store({
        state: {
            userId: 123456,
            hasLogin: true
        },
        // 根据某个state计算一些跟它有关系的状态等
        getters: {
            defaultName(state) {
                return `用户${state.userId}`
            },
            isVisitor(state) {
                return !state.hasLogin
            }
        },
        // 修改state中的属性
        mutations: {
            // 第一个参数传入state，第二个参数(可选)传入额外的参数(载荷payload)
            switchUser(state, newId) {
                // 切换用户，修改存储的用户信息
                state.userId = newId
            },
            logout(state) {
                state.hasLogin = !state.hasLogin
            }
        }
    })
    export default store
```
定义好mutation后，在任何组件中调用 store.commit 方法就可以对state进行修改：

```js
this.$store.commit('switchUser', 654321)
this.$store.commit('logout')
```

Action
======
Action 和 mutation比较类似，但不同在于：
- Action提交的是mutation，而不是直接变更状态。
- Action可以包含任意异步操作。

在index.js中添加action:
```js
    import Vue from 'vue'
    import vuex from 'vuex'
    Vue.use(vuex)
    const store = new vuex.Store({
        state: {
            userId: 123456,
            hasLogin: true
        },
        // 根据某个state计算一些跟它有关系的状态等
        getters: {
            defaultName(state) {
                return `用户${state.userId}`
            },
            isVisitor(state) {
                return !state.hasLogin
            }
        },
        // 修改state中的属性
        mutations: {
            // 第一个参数传入state，第二个参数(可选)传入额外的参数(载荷payload)
            switchUser(state, newId) {
                // 切换用户，修改存储的用户信息
                state.userId = newId
            },
            logout(state) {
                state.hasLogin = !state.hasLogin
            }
        },
        // 操作mutation
        actions: {
            logout(context) {
                context.commit('logout')
            }
        }
    })
    export default store
```
Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此在action中，可以调用 `context.commit` 提交一个 mutation，或者通过 `context.state` 和 `context.getters` 来获取 state 和 getters。

定义好action后，vue组件中通过`store.dispatch`触发：
```js
    this.$store.dispatch('login')
```
action内部可以执行异步操作，也可以像mutation一样用载荷的方式分发。

Module
======
如果项目有很多的状态需要管理，但却把store全都写在index.js中，会显得很臃肿不便于维护，所以我们需要将store拆分成不同的模块（module），每个模块可以拥有自己的state，mutation，action。
在store文件夹下新建一个名为modules的文件夹，下面可以新建一个authority.js，定义一个模块：
```js
// 用户权限状态
export default {
    state: {
        roles: []
    },
    getters: {
    },
    mutations: {
    },
    actions: {
    }
}
```
然后修改index.js:
```js
import Vue from 'vue'
import vuex from 'vuex'
import authority from './modules/authority'
Vue.use(vuex)

export default new vuex.Store({
    modules: {
        authority: authority
    }
})
```
然后在组件中通过`this.$store.state.authority.roles`来获取state

总结
===
vuex的基本用法就写到这里，算是记录并梳理一下自己学习vuex的过程，欢迎各位大佬批评指正。
更多关于vuex的高级用法可以参考官方文档。

参考文献
======
+ https://vuex.vuejs.org/zh-cn/
