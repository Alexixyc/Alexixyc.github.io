---
title: 横向滚动 && 左滑到底触发 "查看更多" 实现方案比较
tags:
  - technology share
date: 2019-06-15 00:00:00
updated: 2019-06-20 00:00:00
categories: technology share #文章分类
---
<img src="./scroll.jpg" width="600px">
本文记录了自己在实现横向滚动 && 左滑到底触发 "查看更多" 的功能时，尝试的几种实现方案，主要解决的问题是Android和ios由于弹性盒子特性的差异而采取的差异化处理。
<!-- more -->
---

## 方案一
Android：待优化
ios：
思路：弹性滚动可以超出元素scrollWidth / 监听容器scroll事件 / 达到临界值触发”查看更多“

实现：监听scroll事件

```js
scrollListener() {
  if (this.topImageList.length === 0) return false;
  let isPreventTrigger = false; // 标志位：防止重复触发
  const dom = this.$refs.imgContainer; // 目标头图容器
  
  const viewPortWidth = parseInt(window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth); // 屏幕视图宽度，当前场景中等于容器可视区域
  
  const func = () => { // handler函数，用于事件绑定和解绑
    const scrollWidth = parseInt(dom.scrollWidth); // 容器内部可滚动的宽度
    if (dom.scrollLeft > (scrollWidth - viewPortWidth + 80)) {
      // 容器向左👈滚动距离 + 容器可视宽度 > 容器可滚动宽度 + 80像素
      if (!isPreventTrigger) {
      	// 并且标志位为false => 触发”查看更多“
        this.onMoreBtnClick();
        setTimeout(() => {
          // 2秒（已经触发了”查看更多”）后，标志位置为false
          isPreventTrigger = false;
        }, 2000);
      }
      // 标志位置为true
      isPreventTrigger = true;
    }
  };
  // 目标容器绑定handler函数
  dom.addEventListener('throttleScroll', func);
  return () => {
    // 返回一个function，用于解除事件绑定
    dom.removeEventListener('throttleScroll', func);
  };
},
```

遇到的问题：
+ 绑定事件的时机不保准，需要借助对topImageList的watch / $nextTick / 甚至还要setTimeout才行；
+ 绑定事件时，存一下remove函数`this.removeScrollListener = this.addScrollListener();`，并且需要手动在`destroyed`时执行一下事件解绑；
+ ios向左滚动到临界点时立即触发“查看更多”（不确定，记不清了）？期望用户抬起手指时触发，并且可以回滑取消触发；
+ Android没有弹性滚动，滚动不可以超出元素scrollWidth，需要另辟蹊径；

## 方案二
ios和Android统一使用hotel-common手势库TouchInertial；
大体思路：
+ 监听容器touch事件，模拟惯性滚动、弹性回弹橡皮筋效果，触发临界点根据事件返回的数据自行判断；

```js
handleEnd() {
  try {
    this.hastransition = true;
    if (this.minSportThreshold - this.translateX > this.threshold * 0.66) {
      setTimeout(() => {
        this.onMoreBtnClick();
      }, 100);
    }
    this.translateX = Math.min(this.maxSportThreshold, Math.max(this.translateX, this.minSportThreshold));
    setTimeout(() => {
      this.hastransition = false;
    }, 300);

    this.scroller.setOptions({
      minSportThreshold: this.minSportThreshold,
    });
  } catch (error) {
  }
},

bindEvents() {
  const el = this.$refs.imgContainer;
  const viewPortWidth = utils.dom.getClientWidth();
  const scrollWidth = el.scrollWidth; // 这一步需要拿到scrollWidth，需要确保scrollWidth是最终值
  this.minSportThreshold = viewPortWidth - scrollWidth;
  this.scroller = new InertialMotion(el, {
    maxSportThreshold: this.maxSportThreshold,
    minSportThreshold: this.minSportThreshold,
    direction: 'x',
    acceleration: 0.00003,
  });
  this.scroller.on('touchstart', () => {
    this.hastransition = false;
  });
  this.scroller.on('touchmove', data => {
    const willX = this.translateX + data.distX;
    if (
      (willX > this.minSportThreshold - this.threshold && willX < this.minSportThreshold)
      || (willX > this.maxSportThreshold && willX < this.maxSportThreshold + this.threshold)
    ) {
      this.translateX = this.translateX + data.distX / 3;
    } else if (willX >= this.minSportThreshold && willX <= this.maxSportThreshold) {
      this.translateX = willX;
    }
  });
  this.scroller.on('beforeAnimation', () => {
    this.scroller.setOptions({
      sportInitValue: this.translateX,
      maxSportThreshold: this.maxSportThreshold + this.threshold * 0.66,
      minSportThreshold: this.minSportThreshold - this.threshold * 0.66 + 10,
    });
  });
  this.scroller.on('animationChange', distance => {
    this.translateX = distance;
  });
  this.scroller.on('animationEnd', this.handleEnd.bind(this));
  this.scroller.on('tap', this.handleEnd.bind(this));
},
```

+ watch`topImageList`的长度变化。但发现`nextTick`的回调中不能保证正确地取到容器的scrollWidth值，所以加了一个`setTimeout`，并添加日志，上报`setTimeout`前后的数据。

```js
topImageList(nVal, oVal) {
  if (nVal.length !== oVal.length) {
    this.$nextTick(() => {
      // *****LOG***** //
      const swBefore = this.$refs.imgContainer.scrollWidth;
      const maxBefore = this.maxSportThreshold;
      const minBefore = this.minSportThreshold;
      const vwBefore = this.$refs.imageWrap.offsetWidth;
      setTimeout(() => {
        this.bindEvents();
        const swDelay = this.$refs.imgContainer.scrollWidth;
        const maxDelay = this.maxSportThreshold;
        const minDelay = this.minSportThreshold;
        const vwDelay = this.$refs.imageWrap.offsetWidth;
        if (swDelay - swBefore > 1 || vwBefore !== vwDelay) {
          utils.statistics.feError({
            pageType: 'detail',
            errorType: 'custom',
            errorSubType: 'scrollWidthNew',
            errorMessage: 'scrollWidth获取不一致',
            extParams: {
              swBefore,
              swDelay,
              maxBefore,
              maxDelay,
              minBefore,
              minDelay,
              vwBefore,
              vwDelay,
              lengthBefore: oVal.length,
              lengthDelay: nVal.length,
              lengthCurrent: this.topImageList.length,
            },
          });
        }
      });
    // *****LOG***** //
    });
  }
},
```

改进点：
+ ios Android统一处理
+ 手动实现惯性滚动参数可调；

遇到的问题：
+ 实例化的时机不好把握。需要确保容器渲染完成后，再实例化，但仍然需要依赖`setTimeout`；
+ 同样需要手动在`destroyed`中进行事件的解绑；

## 方案三 🌝
ios 和 Android都使用原生的滚动，监听touch事件
ios：监听touchend事件，当touchend触发时，判断一下是否到达零界点即可；
Android：当滚动到最右侧时，开始触发translateX；

```js
onTouchStart(e) {
  if (isAndroid) {
    this.hasTransition = false;
    this.clientX = parseInt(e.changedTouches[0].clientX);
  }
},

onTouchMove(e) {
  if (isAndroid) {
    const el = this.$refs.imgContainer;
    const { offsetWidth, scrollLeft, scrollWidth } = el;
    const threshold = scrollWidth - (offsetWidth + scrollLeft);
    const currentX = parseInt(e.changedTouches[0].clientX);
    const distance = currentX - this.clientX;
    this.clientX = currentX;
    if (threshold <= 0) {
      // 已经滑到最右侧，即将触发translateX
      if (!this.isMoving) {
        this.isMoving = true;
        this.moveStartX = currentX;
      }
      if (this.translateX + distance < -60) {
        this.translateX = -60;
      } else if (this.translateX + distance >= 0) {
        this.translateX = 0;
      } else {
        this.translateX = this.translateX + distance;
      }
    }
    if (currentX < this.moveStartX) {
      this.$refs.imgContainer.style.setProperty('overflow-x', 'hidden');
    }
  }
},

onTouchEnd() {
  if (isAndroid) {
    this.hasTransition = true;
    if (this.translateX < -55) {
      setTimeout(() => {
        this.onMoreBtnClick();
      }, 150);
    }
    this.moveStartX = 0;
    this.isMoving = false;
    this.translateX = 0;
    this.$refs.imgContainer.style.setProperty('overflow-x', 'auto');
  } else {
    const el = this.$refs.imgContainer;
    const { offsetWidth, scrollLeft, scrollWidth } = el;
    const threshold = scrollWidth - (offsetWidth + scrollLeft);
    if (threshold < -55) {
      setTimeout(() => {
        this.onMoreBtnClick();
      }, 200);
    }
  }
},
```

改进点：
+ Android，ios都是使用原生的滚动，体验更加流畅；
+ 不用考虑在何时绑定事件或者等待容器渲染完毕后创建实例等问题，即不用判断头图容器渲染完毕的时机；
+ 直接使用vue的v-on指令绑定touchstart、touchmove、touchend，不需要手动销毁事件绑定，组件销毁时，事件自动删除；

缺陷：
+ Android中当滑到临界点后，手动回滚，取消触发“查看更多”事件时，需要重新触发touchstart才能重新触发滚动。