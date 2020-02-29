---
title: Typescript 👀
tags:
  - study notes
date: 2019-12-01 00:00:00
updated: 2019-12-05 00:00:00
categories: study notes #文章分类
---
<img src="./nginx.png" width="600px">
本文记录了自己的Lua
由于在近期工作中，前端微服务项目需要自己写一些静态资源访问的相关Nginx配置，而作为前端开发人员，对Nginx这块技术一直缺乏比较系统的了解，所以在这里抽空整理了一些Nginx相关的基本知识。
<!-- more -->
---

# TypeScript

## 基础类型
### Boolean
```ts
let isDone: boolean = false;
```
### Numbner
```ts
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
```

### String
```ts
let color: string = "blue";
let fullName: string = `Bob Bobbington`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ fullName }.
I'll be ${ age + 1 } years old next month.`; // 可换行
```

### Array
```ts
// 两种声明方式
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3]; // 不推荐（.jsx可能会有问题）
```

### Tuple 元组
```ts
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
console.log(x[0].substring(1)); // OK
```

### Enum
枚举可以有效的标准化一个数据类型的集合
```ts
// 默认从0开始递增：0，1，2
enum Color {Red, Green, Blue}
let c: Color = Color.Green;

// 初始化第一个值为1，后续值从1开始递增：1，2，3
enum Color {Red = 1, Green, Blue}
let c: Color = Color.Green;

// 可以手动初始化设置所有成员
enum Color {Red = 1, Green = 2, Blue = 4}
let c: Color = Color.Green;
```
后续章节会单独讲解枚举

### Any 任意值
```js
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean
```


## Interfaces 接口
TypeScript的一个核心概念是对值所具有的结构进行类型检查。它有时候被称做“鸭式辨型法”或“结构性子类型化”。
**接口**的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

### 普通接口
```js
// 接口来描述：规定LabeledValue必须包含一个label属性且类型为string
interface LabeledValue {
    label: string;
}

function printLabel(labeledObj: LabeledValue) {
    console.log(labeledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```

### 可选属性
接口里的参数不全是必需的，可以有可选的属性
```js
interface SquareConfig {
  color?: string;
  width?: number;
}
```

### 只读属性
一些对象属性只能在刚刚创建的时候修改其值，可以在属性名前用readonly来指定只读属性。
```ts
interface Point {
    readonly x: number;
    readonly y: number;
}
let p1: Point = { x: 10, y: 20 };
p1.x = 5; // error!
```

**`readonly`** vs **`const`**
最简单判断该用readonly还是const的方法是看要把它做为变量使用还是做为一个属性。 做为变量使用的话用 const，若做为属性则使用readonly。

### 函数类型
接口除了描述带有属性的普通对象外，接口也可以描述函数类型。
为了使用接口表示函数类型，我们需要给接口定义一个调用签名。 它就像是一个只有参数列表和返回值类型的函数定义。参数列表里的每个参数都需要名字和类型。
```js
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
```
- 函数类型的类型检查，函数的参数名不需要与接口里定义的名字相匹配。
```js
mySearch = function(src: string, sub: string) {
  let result = source.search(subString);
  return result > -1;
}
```
- 也可以在使用时，不写参数类型，因为已经在接口里定义过了，typescript会自动推断出类型
```js
let mySearch: SearchFunc;
mySearch = function(src, sub) {
    let result = src.search(sub);
    return result > -1;
}
```
函数返回值若不是接口定义的，则类型检查器会报错。

### 可索引的类型
可索引类型具有一个索引签名，它描述了对象索引的类型，还有相应的索引返回值类型。
```ts
interface StringArray {
  [index: number]: string;
}
let myArray: StringArray;
myArray = ["Bob", "Fred"];
let myStr: string = myArray[0];
```
上面的`StringArray`接口，具有索引签名。这个索引签名表示了用`number`去索引`StringArray`时会得到`string`类型的返回值。

- 可索引签名有两种：字符串和数字，__可以同时混用，但是数字索引的返回值必须是字符串索引的返回值的子类型__。因为当我们在用数字索引的时候，JavaScript会先把它转换成一个字符串，再去当做对象的索-引。例如用`100(number)`当做索引的时候，实际上是当做了`"100"(string)`，所以在检查的时候会先验证`string`类型的索引，__所以`string`类型的索引返回值必须是`number`类型索引返回值的父类型__。
```ts
class Animal {
    name: string;
}
class Dog extends Animal {
    breed: string;
}
// Error: indexing with a numeric string might get you a completely separate type of Animal!
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}

// Ok: indexing with a numeric string might get you a completely separate type of Animal!
interface NotOkay {
  [x: number]: Dog;
  [x: string]: Animal;
}
```

- 当索引和非索引混用时，非索引的返回值需要是索引类型返回值的子集，例如下面的例子：
```ts
interface NumberDictionary {
  [index: string]: number;
  length: number;    // ok, length is a number
  name: string;      // error, the type of 'name' is not a subtype of the indexer
}

// 联合类型
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number;    // ok, length is a number
  name: string;      // ok, name is a string
}
```

- 只读类型
```ts
interface ReadonlyStringArray {
    readonly [index: number]: string;
}
let myArray: ReadonlyStringArray = ["Alice", "Bob"];
myArray[2] = "Mallory"; // error!
```

### 类类型
类的最基本的作用就是，明确地强制一个类去符合某种特定的规则。
```ts
interface ClockInterface {
  currentTime: Date;
}
class Clock implements ClockInterface {
  currentTime: Date = new Date();
  constructor(h: number, m: number) { }
}
```

可以在接口中描述一个方法，然后在类中去实现它，例如下面的`setTime`方法：
```js
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}
class Clock implements ClockInterface {
  currentTime: Date = new Date();
  setTime(d: Date) {
      this.currentTime = d;
  }
  constructor(h: number, m: number) { }
}
```

接口描述了类的公共的部分，而不是公有和私有的部分。这让你不能用他们来检查



静态类型检查
有一些语法糖private...
tsc可以只做静态类型检查/编译js/只生成声明文件





































## Enum 枚举
#### Numeric enums 数字枚举
1.若没有初始化，默认从0开始，递增
2.若初始化某一项位数字，后面的值以此值开始递增
3.若定义成常量和计算类型的混合，则未初始化的值需要写在第一个
```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
enum E {
  A = getSomeValue(),
  B, // Error! Enum member must have initializer.
}
```
#### String enums 字符串枚举
字符串枚举没有自增的表现，每个成员都需要被初始化成一个字符串文字常量
```ts
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

#### Heterogeneous enums 异构枚举
混合数字和字符串的枚举（表达不清晰，除非特殊情况确实需要，通常不建议使用）
```ts
enum BooleanLikeHeterogeneousEnum {
    No = 0,
    Yes = "YES",
}
```

#### Computed and constant members
每个枚举成员都有一个值，这个值关联了一个常量或者需要计算的值