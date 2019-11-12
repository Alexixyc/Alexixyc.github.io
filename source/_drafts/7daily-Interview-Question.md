可以这样捕获promise的reject
```js
try {
  await Promise.reject('reject');
} catch (err) {
  console.log(err);
}
```
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues
###### Q1：写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？ 
> key是给每一个vnode的唯一id,可以依靠key,更准确, 更快的拿到oldVnode中对应的vnode节点。
- 更准确: 避免就地复用，更加准确。
- 更快: 利用key的唯一性生成map对象来获取对应节点，比遍历方式更快。

###### Q2：['1', '2', '3'].map(parseInt) what & why ?
> [1, NaN, NaN]
> 相当于parseInt(1, 0) / parseInt(2, 1) / parseInt(3, 2)

###### Q3：什么是防抖和节流？有什么区别？如何实现？
- 防抖：触发高频事件后n秒内函数只会执行一次，如果n秒内高频时间再次触发，则重新计算事件。（输入框，输入停止后n秒后触发推荐异步请求）
> 思路：每次触发事件时都取消之前的延时调用方法
- 节流：高频事件触发，但在n秒内只会执行一次，稀释函数的执行频率。（touchmove，鼠标滚轮，scroll）
> 思路：每次触发事件时都判断当前是否有等待执行的延时函数

###### Q4：介绍下 Set、Map、WeakSet 和 WeakMap 的区别？ 
1. 集合（Set)
ES6新增的一种新的数据结构，类似于数组，但成员是唯一且无序的，没有重复的值。
Set 本身是一种构造函数，用来生成 Set 数据结构。
Set 对象允许你储存任何类型的唯一值，无论是原始值或者是对象引用。
- Set实例属性
  - constructor：构造函数
  - size：元素数量
- Set实例方法
  - 操作方法
    - add(value)：新增，相当于 array里的push
    - delete(value)：存在即删除集合中value
    - has(value)：判断集合中是否存在 value
    - clear()：清空集合
  - 遍历方法
    - keys()：返回一个包含集合中所有键的迭代器
    - values()：返回一个包含集合中所有值得迭代器
    - entries()：返回一个包含Set对象中所有元素得键值对迭代器
    - forEach(callbackFn, thisArg)：用于对集合成员执行callbackFn操作，如果提供了 thisArg 参数，回调中的this会是这个参数，没有返回值

2. WeakSet
WeakSet 对象允许你将弱引用对象存储在一个集合中
- WeakSet 与 Set 的区别：
  - WeakSet 只能储存对象引用，不能存放值，而 Set 对象都可以
  - WeakSet 对象中储存的对象值都是被弱引用的，即垃圾回收机制不考虑 WeakSet 对该对象的应用，如果没有其他的变量或属性引用这个对象值，则这个对象将会被垃圾回收掉（不考虑该对象还存在于 WeakSet 中），所以，WeakSet 对象里有多少个成员元素，取决于垃圾回收机制有没有运行，运行前后成员个数可能不一致，遍历结束之后，有的成员可能取不到了（被垃圾回收了），WeakSet 对象是无法被遍历的（ES6 规定 WeakSet 不可遍历），也没有办法拿到它包含的所有元素
- 属性
  - constructor：构造函数，任何一个具有 Iterable 接口的对象，都可以作参数
- 方法
  - add(value)：在WeakSet 对象中添加一个元素value
  - has(value)：判断 WeakSet 对象中是否包含value
  - delete(value)：删除元素 value

3. 字典（Map）
- Set 和 Map 的区别
  - 共同点：都可以存储不重复的值
  - 不同点：集合是以[value, value]的形式存储元素，Map是以[key, value]的形式存储
- 属性
  - constructor：构造函数
  - size：返回字典中所包含的元素个数
- 操作方法
  - set(key, value)：向字典中添加新元素
  - get(key)：通过键查找特定的数值并返回
  - has(key)：判断字典中是否存在键key
  - delete(key)：通过键 key 从字典中移除对应的数据
  - clear()：将这个字典中的所有元素删除
- 遍历方法
  - keys()：将字典中包含的所有键名以迭代器形式返回
  - values()：将字典中包含的所有数值以迭代器形式返回
  - entries()：返回所有成员的迭代器
  - forEach()：遍历字典的所有成员

  4. WeakMap

###### Q5：介绍下深度优先遍历和广度优先遍历，如何实现？

###### Q5：请分别用深度优先思想和广度优先思想实现一个拷贝函数？

###### Q7: ES5/ES6 的继承除了写法以外还有什么区别？
- class声明会提升，但不会初始化赋值
- class 声明内部会启用严格模式
- class 的所有方法（包括静态方法和实例方法）都是不可枚举的
- class 的所有方法（包括静态方法和实例方法）都没有原型对象 prototype，所以也没有`[[construct]]`，不能使用 new 来调用
- 必须使用 new 调用 class
- class 内部无法重写类名

- ES5最常见的两种继承：原型链继承、构造函数继承
> - 原型链继承
> 原型链继承通过原型链之间的指向进行委托关联
```js
  // 定义父类
  function Parent(name) {
    this.name = name;
  }

  Parent.prototype.getName = function () {
    return this.name;
  }

  // 定义子类
  function Children() {
    this.age = 24;
  }

  // 通过children的prototype属性和parent进行关联继承
  Children.prototype = new Parent('Alexi');

  let person = new Children();
  // person.age   24
  // person.name   Alexi
```

> - 构造函数继承
> 构造继承关键在于，通过在子类的内部调用父类，即通过使用apply()或call()方法可以在将来新创建的对象上获取父类的成员和方法。
```js
  // 定义父类
  function Parent(name) {
    this.name = name;
    this.age = 24;
  }

  // 定义子类
  function Children() {
    Parent.apply(this, arguments);
  }

  let person = new Children('Alexi')
  // person.age   24
  // person.name   Alexi
```

> - ES6继承
> ES6中新增了class关键字来定义类，通过保留的关键字extends实现了继承。实际上这些关键字只是一些**语法糖**，底层实现还是通过**原型链之间的委托关联关系**实现继承。
```js
  // 定义父类
  class Father {
      constructor(name, age) {
          this.name = name;
          this.age = age;
      }

      show() {
          console.log(`我叫:${this.name}， 今年${this.age}岁`);
      }
  };

  // 通过extends关键字实现继承
  class Son extends Father {};

  let son = new Son('陈先生', 3000);
  
  son.show(); // 我叫陈先生 今年3000岁
```

> - 区别
> 区别于ES5的继承，ES6的继承实现在于使用super关键字调用父类，反观ES5是通过call或者apply回调方法调用父类

###### Q8: setTimeout、Promise、Async/Await 的区别？
> 考察事件循环中宏任务微任务的概念
- async/await
```js
  async function async1(){
    console.log('async1 start');
      await async2();
      console.log('async1 end')
  }
  async function async2(){
      console.log('async2')
  }

  console.log('script start');
  async1();
  console.log('script end')
  // 输出顺序：script start->async1 start->async2->script end->async1 end
```
> async 函数返回一个 Promise 对象，当函数执行的时候，**一旦遇到 await 就会先返回，等到触发的异步操作完成，再执行函数体内后面的语句。**可以理解为，是让出了线程，跳出了 async 函数体。可以这么理解：**实际上，await是一个让出线程的标志。await后面的表达式会先执行一遍，然后将await后面的代码加入到microtask中，然后就会跳出整个async函数来执行后面的代码。**

###### Q9: Async/Await 如何通过同步的方式实现异步？

###### Q10: 常见异步笔试题
https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/7 **（事件循环👍）**
```js
  // jrtt面试题
  async function async1() {
      console.log('async1 start')
      await async2()
      console.log('async1 end')
  }
  async function async2() {
      console.log('async2')
  }
  console.log('script start')
  setTimeout(function () {
      console.log('settimeout')
  })
  async1()
  new Promise(function (resolve) {
      console.log('promise1')
      resolve()
  }).then(function () {
      console.log('promise2')
  })
  console.log('script end')
  // script start->async1 start->async2->promise1->script end->async1 end->promise2->settimeout
```

###### Q11: 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组
```js
function fn(arr) {
 return Array.from(new Set(arr.flat(Infinity))).sort((a, b) => a - b);
}
```

###### Q12: JS 异步解决方案的发展历程以及
> 回调函数->promise->generator->async/await

###### Q13: Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？

###### Q14: 实现一个new方法 【待牢固】
```js
function _new(fn, ...arg) {
  const obj = Object.create(fn.prototype);
  const ret = fn.apply(obj, arg);
  return ret instanceof Object ? ret : obj;
}
```

###### Q15: 简单讲解一下 http2 的多路复用【待牢固】
- HTTP1.x中，并发多个请求需要多个TCP连接，浏览器为了控制资源会有6-8个TCP连接都限制。
- HTTP2多路复用代替了HTTP1.x的序列和阻塞机制，所有的相同域名请求都通过同一个TCP连接并发完成。
- HTTP2采用二进制格式传输，取代了HTTP1.x的文本格式，二进制格式解析更高效。
- HTTP2中，同域名下所有通信都在单个连接上完成，消除了因多个 TCP 连接而带来的延时和内存消耗。
- HTTP2单个连接上可以并行交错的请求和响应，之间互不干扰

###### Q16: 谈谈你对TCP三次握手和四次挥手的理解
https://juejin.im/post/5c078058f265da611c26c235#heading-12 (形象的对话形式，很好的理解概念)

###### Q17: A、B 机器正常连接后，B 机器突然重启，问 A 此时处于 TCP 什么状态?

###### Q18: React 中 setState 什么时候是同步的，什么时候是异步的？

###### Q21: 有以下 3 个判断数组的方法，请分别介绍它们之间的区别和优劣
Object.prototype.toString.call() 、 instanceof 以及 Array.isArray()