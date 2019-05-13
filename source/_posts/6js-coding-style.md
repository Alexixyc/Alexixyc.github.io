---
title: JavaScript编程风格
tags:
  - study notes
date: 2019-01-23 17:56:37
updated: 2019-01-23 17:56:37
categories: study notes #文章分类
---
<img src="./jscs.jpg" width="500px">
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

### 变量
使用有意义并且可读性强的变量名
```js
// bad
const yyyymmdstr = moment().format('YYYY/MM/DD');

// good
const currentDate = moment().format('YYYY/MM/DD');
```

使用同样的的单词来命名同样类型的变量

```js
// bad
getUserInfo();
getClientData();
getCustomerRecord();

// good
getUser();
```

使用可搜索的名称: *让代码具有可读性和可搜索性是很重要的*
```js
// bad
// What the heck is 86400000 for?
setTimeout(blastOff, 86400000);

// good
// 声明它们为大写的常量
const MILLISECONDS_IN_A_DAY = 86400000;
setTimeout(blastOff, MILLISECONDS_IN_A_DAY);
```

使用有解释性的变量
```js
// bad
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(address.match(cityZipCodeRegex)[1], address.match(cityZipCodeRegex)[2]);

// good
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [, city, zipCode] = address.match(cityZipCodeRegex) || [];
saveCityZipCode(city, zipCode);
```

避免不清晰的mapping *明确的比隐式的要好*
```js

// bad
const locations = ['Austin', 'New York', 'San Francisco'];
locations.forEach((l) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  // Wait, what is `l` for again?
  dispatch(l);
});

// good
const locations = ['Austin', 'New York', 'San Francisco'];
locations.forEach((location) => {
  doStuff();
  doSomeOtherStuff();
  // ...
  // ...
  // ...
  dispatch(location);
});
```

不要添加没有必要的多余的文本：*如果你的对象名或者类名已经清晰的指明了它的作用，没有必要再在属性名中重复的写多余的内容*

```js
// bad
const Car = {
  carMake: 'Honda',
  carModel: 'Accord',
  carColor: 'Blue'
};

function paintCar(car) {
  car.carColor = 'Red';
}

// good
const Car = {
  make: 'Honda',
  model: 'Accord',
  color: 'Blue'
};

function paintCar(car) {
  car.color = 'Red';
}
```

定义默认的参数，而不是在函数中用条件语句定义参数：*定义默认参数往往比短竖线条件语句更加清晰，而且最大的区别在于，你的函数仅仅会在参数是`undefined`的时候才会提供默认参数。而其他的“falsy”值，比如`''，false，null，0，NaN`都不会被默认值替代。然而，短竖线的条件语句就不是这样。*
```js
// bad
function createMicrobrewery(name) {
  const breweryName = name || 'Hipster Brew Co.';
  // ...
}

// good
function createMicrobrewery(name = 'Hipster Brew Co.') {
  // ...
}
```

### 函数1
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

### 函数2

函数的参数，在理想情况下，定义成少于等于2个。
*限制函数参数的数量是非常重要的，因为这样可以使得测试你的函数更加简单。函数定义超过三个变量时，当你针对每个独立的参数使用大量的不同的情况来测试函数时，会诱发组合性的爆炸。*

*一个或者两个参数是最理想的情况，三个参数的情况要尽量避免。任何更多的参数的情况，参数应该被合并。通常，如果一个函数有超过两个参数，那么使用一个高级的对象当做函数的参数就可以了。*

*为了更清晰的体现函数期望的参数，我们可以使用ES6的解构赋值语法，它的优点在于：*
> 1. 函数的参数清晰明了，可以清晰直观地看到函数要用到哪些属性。
> 2. 解构赋值拷贝了传递给函数的参数对象的指定的原始值。（ps: 从参数对象中解构出来的对象和数组是没有被拷贝的）
> 3. Linters can warn you about unused properties, which would be impossible without destructuring。(但我尝试了一下，无论有没有解构传参，eslint都会提示unused参数，🤔 奇怪 ）

```js

// bad
function createMenu(title, body, buttonText, cancellable) {
  // ...
}

// good
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}

createMenu({
  title: 'Foo',
  body: 'Bar',
  buttonText: 'Baz',
  cancellable: true
});
```

一个函数应该只做一件事：*函数更容易重构，代码更加可读，更加干净。*
```js
// bad
function emailClients(clients) {
  clients.forEach((client) => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}

// good
function emailActiveClients(clients) {
  clients
    .filter(isActiveClient)
    .forEach(email);
}

function isActiveClient(client) {
  const clientRecord = database.lookup(client);
  return clientRecord.isActive();
}
```

函数的命名应该表达清楚这个函数做了什么。
```js
// bad
function addToDate(date, month) {
  // ...
}
const date = new Date();
// It's hard to tell from the function name what is added
addToDate(date, 1);

// good
function addMonthToDate(month, date) {
  // ...
}
const date = new Date();
addMonthToDate(1, date);
```

函数应该只有一层的抽象概念

移除重复的代码: *重复的代码的缺点在于，如果需要修改相同的逻辑，你需要修改不同的好几个地方*

使用Object.assign来设置默认对象参数
```js
// bad:
const menuConfig = {
  title: null,
  body: 'Bar',
  buttonText: null,
  cancellable: true
};

function createMenu(config) {
  config.title = config.title || 'Foo';
  config.body = config.body || 'Bar';
  config.buttonText = config.buttonText || 'Baz';
  config.cancellable = config.cancellable !== undefined ? config.cancellable : true;
}

createMenu(menuConfig);

// good
const menuConfig = {
  title: 'Order',
  // User did not include 'body' key
  buttonText: 'Send',
  cancellable: true
};

function createMenu(config) {
  config = Object.assign({
    title: 'Foo',
    body: 'Bar',
    buttonText: 'Baz',
    cancellable: true
  }, config);

  // config now equals: {title: "Order", body: "Bar", buttonText: "Send", cancellable: true}
  // ...
}

createMenu(menuConfig);
```

不要把标志位当做函数的参数来传递:*函数应该只做一件事情，但标志位的使用，说明你用一个函数来做了不止一件事情。如果你通过一个Boolean值来决定了不同的代码路径，那么请拆分成不同的函数。*
```js

// bad:
function createFile(name, temp) {
  if (temp) {
    fs.create(`./temp/${name}`);
  } else {
    fs.create(name);
  }
}

// good
function createFile(name) {
  fs.create(name);
}

function createTempFile(name) {
  createFile(`./temp/${name}`);
}
```

避免函数的副作用（两个例子）
1) 避免修改函数体外的全局变量
```js
// bad:
// Global variable referenced by following function.
// If we had another function that used this name, now it'd be an array and it could break it.
let name = 'Ryan McDermott';

function splitIntoFirstAndLastName() {
  name = name.split(' ');
}

splitIntoFirstAndLastName();

console.log(name); // ['Ryan', 'McDermott'];

// good
function splitIntoFirstAndLastName(name) {
  return name.split(' ');
}

const name = 'Ryan McDermott';
const newName = splitIntoFirstAndLastName(name);

console.log(name); // 'Ryan McDermott';
console.log(newName); // ['Ryan', 'McDermott'];
```

2）如果需要处理传递进来的参数，总是拷贝它再编辑它，避免直接修改传递的参数。
*购物车案例：购物车cart是一个包含了所有要购买的物品item的数组，它是purchase请求的一个参数。当网络比较差的时候，purchase接口可能会一直处于尝试发送请求的状态，而在这个时候，如果用户不小心点击了一个不想购买的物品，添加到了购物车，然后这时候开始了网络请求，此时的副作用就是，请求可能会传递修改后的cart对象。*
```js
// bad
const addItemToCart = (cart, item) => {
  cart.push({ item, date: Date.now() });
};

// good:
const addItemToCart = (cart, item) => {
  return [...cart, { item, date: Date.now() }];
};
```

不要写全局的函数


### 参考资料
> http://es6.ruanyifeng.com/#docs/style
> https://github.com/ryanmcdermott/clean-code-javascript （译）