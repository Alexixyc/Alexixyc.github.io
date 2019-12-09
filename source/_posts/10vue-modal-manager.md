---
title: VueModalManager —— 移动端全屏弹窗管理插件
tags:
  - technology project
date: 2019-11-15 00:00:00
updated: 2019-11-28 00:00:00
categories: technology project #文章分类
---
<img src="./vue-plugin.jpg" width="600px">
本文记录了一款自己开发的移动端全屏弹窗管理的vuejs插件，目的是针对移动端全屏页面弹窗，对APP外和APP内的环境做差异化处理。该插件没有对外开放，但可以分享一下在设计与实践过程中的一些思路和经验。

<!-- more -->
---

## Part.1 前言
不知道大家在移动端h5开发中，有没有遇到过这样一种场景：点击按钮，一个满屏的二级子页面从屏幕从右向左滑出，关闭二级页面时，再从左向右消失？听上去仿佛是一个很常见场景，但在实际开发中，我却发现了这种全屏弹窗很让人崩溃的一面。

假设我们把全屏弹窗的显隐状态维护在vuex中，通过修改store中visible的值来控制是否显示它，并且配合transition过渡，是可以轻松实现这个功能的。但是，在手机浏览器中，点击浏览器自带的返回按钮会触发history栈的回退，这就导致了页面会直接返回到前一个页面。

但假设我们把全屏弹窗当做一个子路由，通过修改路由来控制它的显隐，在马蜂窝APP中，又会影响webview对h5页面的统计。

这样问题就来了，到底应该如何维护全屏弹窗的显隐状态呢？带着这个问题，我尝试着写了一个插件（vue-modal-manage）来解决这个问题。

> 注：由于该插件是针对马蜂窝APP的业务场景做的，故下文中提到的APP均指马蜂窝APP.

## Part.2 设计与实现

1.目的
  通过对功能需求和现有业务场景的梳理，基本确定这个modalManager最终实现的效果期望是：
- 在马蜂窝APP内，页面自定义顶部导航栏，全屏弹窗以组件的形式嵌入页面，根据统一的状态管理控制显隐；
- 在非马蜂窝APP中，全屏弹窗以子路由的形式渲染，根据路由变化控制显隐；

2.设计思路
  - 首先，在实例化vue根组件的时候，需要对router进行拦截并且根据是否是APP环境做差异化处理；
  - 其次，在VueModalManager插件内部需要定义一套状态管理属性和方法，用于控制当前弹窗的显隐状态；
  - 设计全屏弹窗包裹组件，用于处理弹窗的渲染、显隐状态，路由钩子等逻辑，以完全地控制全屏弹窗的状态；

3.具体实现
> 3.1处理modalConfig

在业务代码中定义一个modalConfig.js文件，它导出一个对象，该对象维护了那些全屏弹窗组件的信息，以及设置一些参数，例如是否开启调试模式等。VueModalManager类在实例化时接受这个配置项，并且在constructor方法中初始化了实例属性modals，用于维护所有全屏弹窗的基础信息以及显隐状态：
```js
const state = {};
const { modals } = config;
modals.forEach(modal => {
  state[modal.name] = {
    name: modal.name,
    title: modal.title || '',
    parentRouteName: modal.parentRouteName,
    component: modal.component,
    transitionTime: modal.transitionTime || 200,
    isOpen: false,
  };
});
this.modals = Vue.observable(state);
```
> 3.2路由拦截

VueModalManager类定义了一个wrapRouter方法，接受vue-router实例化后的router对象作为参数，用于在实例化vue根组件时，对router对象进行包裹。内部逻辑主要就是根据环境对router对象进行差异化处理：

若环境不是APP内，则遍历router对象的route，根据this.modals修改对应页面的路由，设置children组件为由modalWrapper生成的弹窗组件，最后使用router.addRoutes()方法替换路由；
```js
const child = {
  name,
  path: name,
  components: {
    [name]: Vue.component(`${name.toLowerCase()}-modal-wrapper`, createModalWrapper(modalConf)),
  },
};
...
routes[i].children.push(child);
...
if (!this.isApp) {
  router.addRoutes(routes);
}
```

若环境是App内，则不对router做任何处理，直接返回；

> 3.3vue原型挂载$modalManager

接下来，需要暴露一个在页面组件中可调用的方法，定义为`$modalManager`。调用`$modalManager`方法，希望在组件中可以拿到整个modals对象、当前显示的currentModal，以及打开和关闭modal的两个方法，具体实现方法如下：

首先，在插件的install方法中，通过Vue.mixin全局注入的方式，在beforeCreate()生命周期中，把实例化后的modalManager对象和根vue实例，分别绑定到`this._modalManager`和`this._modalManagerRoot`上；
```js
Vue.mixin({
  beforeCreate() {
    if (isDef(this.$options.modalManager)) {
      this._modalManagerRoot = this;
      this._modalManager = this.$options.modalManager;
    } else {
      this._modalManagerRoot = (this.$parent && this.$parent._modalManagerRoot) || this;
    }
  },
});
```
然后，调用Object.defineProperty()方法，在Vue的原型上定义只读的`$modalManager`属性。包含modals、currentModal两个属性，以及openModal()和closeModal()两个方法，以供在组件业务代码中灵活的调用：
```js
Object.defineProperty(Vue.prototype, '$modalManager', {
  get() {
    return {
      modals: this._modalManagerRoot._modalManager.modals,
      currentModal: this._modalManagerRoot._modalManager.currentModal,
      // 如果不是APP，只做路由的操作，pushs或者back；modalState的修改在createModalWrapper的路由钩子里做
      // 如果是App，只做modal状态的改变，即modalState的修改；
      openModal: name => {
        if (!this._modalManagerRoot._modalManager.isApp) {
          const { query } = this.$route;
          this.$router.push({
            name,
            query,
          });
        } else {
          this._modalManagerRoot._modalManager.openModal(name);
        }
      },
      closeModal: name => {
        if (!this._modalManagerRoot._modalManager.isApp) {
          this.$router.back();
        } else {
          this._modalManagerRoot._modalManager.closeModal(name);
        }
      },
    };
  },
});
```
至此，VueModalManager这个类的基本内容就结束了，接下来是两个组件createModalWrapper和ModalView的实现。

> 3.4 createModalWrapper注册全局组件

在`VueModalManager类`拦截路由的模块里，我们在遍历config文件的同时，通过调用Vue.component()和`createModalWrapper`方法，把config中的弹窗组件注册到了全局。目的就是把所有的全屏弹窗都经过`createModalWrapper`包裹，变成`xxxx-modal-wrapper`全局组件，并且可以统一地在`beforeRouteEnter`、`beforeRouteLeave`的路由钩子里控制modal显隐以及一些modals状态维护的操作。

首先，`createModalWrapper`方法接受弹窗组件和组件名，内部声明模板内容和component，并且传递了可以在modal组件内部关闭modal的close方法：
```js
export default function ({ name, component }) {
  return {
    template: `<${component.name} :visible="isShowModal" @close="closeModal"/>`,
    components: { [component.name]: component },
  };
}
```

然后，监听`$modalManager`中对应modal组件的`isOpen`属性，把这个属性值作为visible字段传递给modal组件的内部，在内部接受后，可以传递给由`<transition>`组件包裹的modal最外层div。
```js
computed: {
  isShowModal() {
    return this.$modalManager.modals[name].isOpen;
  },
},
```

其次，由于在APP外的浏览器环境下，除了点击页面按钮可以打开关闭全屏弹窗以外，还期望用户在操作浏览器自带的前进后退时，也能实现全屏弹窗切换的效果，所以我们需要在`beforeRouteEnter`和`beforeRouteLeave`路由钩子阶段分别调用`modalManager`对象中的`openModal`和`closeModal`方法，这样一来，全屏弹窗变回随着路由的变化而变化。

但是需要注意的一点是，我期望用户在全屏弹窗的页面下刷新浏览器时，能够回退到上一个主页面（目的是弱化全屏弹窗是一个页面的感觉）。所以在`beforeRouteEnter`中需要特殊处理调用`openModal`的时机，即：先判断`from.name`是否存在，若不存在，则说明`beforeRouteEnter`钩子是页面刷新进来的，这个时候将页面`replace`到`currentRoute`中`parendRouteName`字段对应的路由页面下即可。

最后，在弹窗组件的`closeModal()`方法中，需要手动的调用`$modalManager.closeModal()`方法，这样就可以在弹窗组件中显示的调用`$emit('close)`来关闭弹窗。
并且`closeModal(callback)`方法接受一个callback回调，这样就可以在关闭弹窗后执行一些额外的逻辑。

> 3.5 ModalView函数式组件

上一步的`createModalWrapper`方法渲染出来的`xxxx-modal-wrapper`modal包裹组件是在真实的modal组件外最近的一层包裹，目的是统一的处理维护一些状态和路由生命周期等。然而最开始我们说过，我们要解决的问题是：要统一化的处理全屏弹窗在APP外和APP内的差异。即希望：**在APP内，弹窗组件以普通组件的形式直接嵌入父组件；而在APP外，弹窗组件以子路由的形式出现在父组件中。**

而我们又知道，在父组件中，子路由组件需要通过`<router-view />`组件来渲染。所以在最后，我们还需要再编写一个组件来控制父组件中，渲染全屏弹窗的位置是需要直接出现`xxxx-modal-wrapper`modal包裹组件，还是一个`<router-view />`组件，这就是这个`ModalView`要做的事情。

`ModalView`这里采用了vue的函数式组件的形式，props接受一个`name`字段用于声明`[name]-modal-wrapper`组件，核心的内容如下：
```js
props: {
  name: {
    type: String,
    default: () => '',
  },
},
...
render(createElement) {
  const isApp = this._modalManagerRoot._modalManager.isApp;
  if (isApp) {
    return createElement(`${this.name.toLowerCase()}-modal-wrapper`);
  }
  return createElement('router-view', {
    attrs: {
      name: this.name,
    },
  });
}
```

内容其实非常简单，因为要做的事情很明确：根据当前环境来决定是渲染`xxxx-modal-wrapper`还是`<router-view />`。

完成`ModalView`的编写后，我们要知道这个组件才是在业务代码中需要直接写入页面的组件，所以在这之前，我需要在VueModalManager类的install方法里，全局的注册`ModalView`组件。
```js
Vue.component(ModalView.name, ModalView);
```

> 3.6 一切就绪，在业务组件中的使用

到这里为止，整个VueModalManager的设计思路以及几个模块的实现方式，都已经介绍完毕了，上面的部分可以整体封装在插件内部，接下来看看如何在业务代码中使用它。

首先，我们需要在业务中编写一个modalConfig.js文件，定义好所有需要全屏展示的弹窗的基础信息：
```js
import homeSearch from './components/SearchDialog.vue';
export default {
  debug: false,
  mode: 'app', // noapp
  modals: [
    {
      name: 'homeSearch',
      component: homeSearch,
      parentRouteName: 'home',
      transitionTime: 200,
    },
    ...
};
```
然后，在app.js中做一些初始化的工作，包括:
实例化`modalManager`；调用`Vue.use(VueModalManager)`；实例化Vue实例时，传入`modalManager`；拦截router实例。
```js
import modalConfig from './modalConfig';
import VueModalManager from './VueModalManager';
const modalManager = new VueModalManager(modalConfig);
...
Vue.use(VueModalManager); // 执行插件中的install方法
...
const app = new Vue({
  el: '#_j_app',
  template: '<router-view></router-view>',
  store,
  router: modalManager.wrapRouter(router),
  modalManager,
});
```

接下来，需要在页面中声明全屏弹窗。因为已经在插件中去全局定义了ModalView组件，所以只需要直接写`modalView`组件，并且传递一个映射了modalConfig中配置的modal名称的name字段即可；
```html
<modal-view name="homeSearch" />
```

最后，在父组件中调用`$modalManager.openModal`方法可以开启弹窗；弹窗组件内部直接`$emit('close')`就可以关闭弹窗了。
```js
// 父组件：
this.$modalManager.openModal('homeSearch');
```
```js
// SearchDialog.vue
$emit('close');
```

## Part.3 总结
在前期需求调研中，观察了行业中类似的h5全屏弹窗的处理，确实没有发现一个特别完美且统一的方案。假设拿一个目的地选择的二级页面来说，一个侧滑出来的全屏窗口，痛点就在于到底是是希望强调"弹窗"的概念，还是强调"页面"的概念。如果希望它是一个独立页面，那直接用路由是无可厚非的，但如果不希望这类弹窗是一个单独的路由页（考虑到APP里的统计），那只能根据环境做差异化处理。

但是，差异化处理的逻辑如果都写到业务代码里，对于项目长期的迭代和维护无疑是一个成本很高的工程。于是就有了开发一个`modalManager`插件的想法，目的在于提取出全屏弹窗管理的逻辑代码，尽可能地降低业务代码的复杂度，提高可维护性。

希望文中的思路能在大家日常前端的组件化开发、插件开发中提供一点帮助吧。


