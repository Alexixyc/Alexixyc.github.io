---
title: ES6编程风格
tags:
  - study notes
date: 2019-01-23 17:56:37
updated: 2019-01-23 17:56:37
categories: study notes #文章分类
---
<img src="./cover-image.jpg" width="500px">
对于团队协作的开发者，编程规范是很重要的。本文持续收集/整理/更新一些js开发的良好代码规范，当做笔记，规范自己的代码风格，让自己的代码更好看👀。
<!-- more -->
---

### let const
建议优先使用const，尤其是在全局环境。
所有函数都应该设置为const。

```js
// bad
var a = 1, b = 2, c = 3;

// good
const a = 1;
const b = 2;
const c = 3;

// best
const [a, b, c] = [1, 2, 3];
```

### 字符串
静态字符串一律使用单引号或反引号，不使用双引号，动态字符串使用反引号。

```js
// bad
const a = "foobar";
const b = 'foo' + a + 'bar';

// acceptable
const c = `foobar`;

// good
const a = 'foobar';
const b = `foo${a}bar`;
```

### 解构赋值
用数组成员对变量赋值时，优先使用解构赋值。
```js
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```

函数的参数如果是对象的成员，优先使用解构赋值。
```js
// bad
function getFullName(user) {
  const firstName = user.firstName;
  const lastName = user.lastName;
}

// good
function getFullName(obj) {
  const { firstName, lastName } = obj;
}

// best
function getFullName({ firstName, lastName }) {
}
```

如果函数返回多个值，优先使用对象的解构赋值，而不是数组的解构赋值。
```js
// bad
function processInput(input) {
  return [left, right, top, bottom];
}

// good
function processInput(input) {
  return { left, right, top, bottom };
}

const { left, right } = processInput(input);
```

### 对象
单行定义的对象，最后一个成员不以逗号结尾；
多行定义的对象，最后一个成员以逗号结尾。
```js
const a = { k1: v1, k2: v2 };
const b = {
  k1: v1,
  k2: v2,
};
```

对象尽量静态化，一旦定义不得随意添加新的属性，实在要添加，使用Object.assgin合并
```js
// bad
const a = {};
a.x = 3;

// if reshape unavoidable
const a = {};
Object.assign(a, { x: 3 });

// good
const a = { x: null };
a.x = 3;
```

如果对象的属性名是动态的，可以在创造对象的时候就用属性表达式定义，将其与其他属性定义在一起。
```js
// bad
const obj = {
  id: 5,
  name: 'San Francisco',
};
obj[getKey('enabled')] = true;

// good
const obj = {
  id: 5,
  name: 'San Francisco',
  [getKey('enabled')]: true,
};
```

对象的属性和方法，尽量采用简洁表达法。
```js
var ref = 'some value';

// bad
const atom = {
  ref: ref,

  value: 1,

  addValue: function (value) {
    return atom.value + value;
  },
};

// good
const atom = {
  ref,

  value: 1,

  addValue(value) {
    return atom.value + value;
  },
};
```

### 数组
使用扩展运算符拷贝数组
```js
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```

使用Array.from方法，将类数组的对象转为数组
```js
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```

### 函数
立即执行的函数可以写成箭头函数形式。

需要使用函数表达式的场合，尽量用箭头函数代替。
```js
// best
let a = [1, 2, 3].map(x => x * x);
```

用箭头函数取代Function.prototype.bind，简单的、单行的、不会复用的函数，建议使用箭头函数。
```js
// bad
const self = this;
const boundMethod = function(...params) {
  return method.apply(self, params);
}

// acceptable
const boundMethod = method.bind(this);

// best
const boundMethod = (...params) => method.apply(this, params);
```

函数所有配置项option都应该集中在一个对象中，并且放在函数的最后一参数中，布尔值不要直接当做参数。
```js
// bad
function divide(a, b, option = false ) {
}

// good
function divide(a, b, { option = false } = {}) {
}
```

不要在函数体内使用arguments变量，使用rest运算符（扩展运算符的逆运算）代替。因为arguments是一个类数组对象，而rest运算符提供的是一个真正的数组。
```js
// bad
function concatenateAll() {
  const args = Array.prototype.slice.call(arguments);
  return args.join('');
}

// good
function concatenateAll(...args) {
  return args.join('');
}
```

使用默认值语法设置函数参数的默认值，而不是在函数内部设置。
```js
// bad
function handleThings(opts) {
  opts = opts || {};
}

// good
function handleThings(opts = {}) {
  // ...
}
```

### Map结构
注意区分Object和Map，只有模拟现实世界的实体对象时，才使用Object。如果只是需要`key: value`的数据结构，使用Map结构。因为Map有内建的遍历机制。
```js
let map = new Map(arr);

for (let key of map.keys()) {
  console.log(key);
}

for (let value of map.values()) {
  console.log(value);
}

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
```

### Class
总是用Class来写需要prototype的操作，用extends实现继承。

### 模块
使用import替代require。

使用export替代module.exports。

export default与普通的export尽量不要混用。

>参考资料
> http://es6.ruanyifeng.com/#docs/style