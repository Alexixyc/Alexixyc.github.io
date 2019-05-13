<!-- redux相关 -->
#### redux:
+ 单一state对象来表示所有的状态
+ 只读
+ 为了描述状态的变化，必须创建一个纯函数(reducer)，接受上一个状态的state和action，返回下一个状态的state。

#### action：
+ 必须有一个type；
+ 序列化id可以定位某一个counter；
+ filter过滤
+ 需要处理未知type，返回旧的state

Action 是把数据从应用（译者注：这里之所以不叫 view 是因为这些数据有可能是服务器响应，用户输入或其它非 view 的数据 ）传到 store 的有效载荷。它是 store 数据的唯一来源。一般来说你会通过 store.dispatch() 将 action 传到 store。
Action 本质上是 JavaScript 普通对象。action 内必须使用一个字符串类型的 type 字段来表示将要执行的动作。

action创建函数：就是生成 action 的方法，它是一个返回action的函数。
Action 创建函数也可以是异步非纯函数。

#### 唯一改变状态树的方法是用action；

#### 纯函数：函数结果仅仅决定于传入的参数。 *只要参数一致，任何环境下返回值都是一样的没有任何副作用（请求、数据库）。

### reducer
reducer是一个纯函数，接受旧的state和action，返回新的state。
保持reducer的纯净性，永远不要在reducer里做这些操作：
+ 修改传入参数
+ 执行有副作用的操作，例如API请求和路由跳转
+ 调用非纯函数，如Date.now()或Math.random()
谨记：只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。


reducer约定：当reducer接受undefined为state参数时，行必须返回应用的初始状态。
ES6 默认参数语法和箭头函数美化reducer代码
```js
// import { createStore } from 'redux'

// reducer
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    default:
      return state
  }
}
```
> 1. 不要修改state。使用Object.assign()创建一个副本，并且必须把第一个参数设置为空对象.
> 2. 在default情况下返回旧的state，以免遇到未知的action。

### store
使用 action 来描述“发生了什么”。
使用 reducers 来根据 action 更新 state 的用法。
Store就是把他们联系到一起的对象。
Store的职责：
+ 维持应用的state
+ 提供getState()方法获取state
+ 提供dispatch(action)方法更新state
+ 通过subscribe(listener)注册监听器
+ 通过subscribe(listener)返回的函数注销监听器

强调：Redux 应用只有一个单一的 store。当需要拆分数据处理逻辑时，你应该使用 reducer 组合 而不是创建多个 store。

createStore() 的第二个参数是可选的, 用于设置 state 初始状态。

```js
// redux的 createStore(reducer)方法，得到一个store
const store = createStore(counter)
// 1.getState方法返回当前状态
console.log(store.getState())
// 2.dispatch方法,分发一个action,修改状态
store.dispatch({ type: 'INCREMENT' })
console.log(store.getState())
const unsubscribe = store.subscribe(() => {
  // 3.subscribe方法, 订阅store的变化，只要状态变化，就会执行这里的回调
})

// 停止监听state更新
unsubscribe()
```

```js
// createStore原理
const createStore = reducer => {
  let state
  let listeners = []
  const getState = () => state;
  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
  }
  const subscribe = (listener) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }
  dispatch({})
  return { getState, dispatch, subscribe };
}
```

#### 数据流
Redux设计核心：严格的单向数据流
Redux四个步骤：
1.调用`store.dispatch(action)`。
> Action 就是一个描述“发生了什么”的普通对象
2.Redux store调用传入的reducer函数。
> Store 会把两个参数传入 reducer：当前的 state 树和 action
3.根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。
4.Redux store 保存了根 reducer 返回的完整 state 树。


### Redux搭配React
>《容器组件和展示组件》原作者：Dan Abramov
> 容器组件（Smart/Container Components）和展示组件（Dumb/Presentational Components）

> 展示型组件：
> + 只关心数据的展示方式
> + 内部可能包含展示型组件和容器型组件，并且通常存在其他DOM元素及其样式
> + 允许通过this.props.children控制组件
> + 不依赖app中的其它文件，像Flux的actions或stores
> + 不关心数据是如何加载和变化的
> + 仅通过props接收数据和回调函数
> + 几乎不用组件内的state（如果用到的话，也仅仅是维护UI状态而不是数据状态）
> + 除非需要用到state,生命周期函数或性能优化，通常写成函数式组件（ps:react创建组件的三总形式）
> + 例如：Page,Sidebar,Story,UserInfo,List

react创建组件的三种形式：
1.无状态函数式组件:
> + 组件不会被实例化，整体渲染性得到提升
> + 组件不能访问this对象
> + 组件无法访问声明周期方法
> + 无状态组件只能访问输入的props，同样的props会得到同样的渲染结构，不会有副作用

2.React.createClass
> react早期刚开始推荐的创建组件方式，逐渐淘汰

3.React.Component
> 以ES6形式来创建react组件，逐渐取代React.createClass

选择：
> 1、只要有可能，尽量使用无状态组件创建形式。
> 2、否则（如需要state、生命周期方法等），使用`React.Component`这种es6形式创建组件


> 容器型组件：
> + 关心数据的运作方式
> + 内部可能包含展示型组件和容器型组件，但是通常没有任何用于自身的DOM元素，除了一些用于包裹元素的div标签，并且不存在样式
> + 为展示型组件和容器型组件提供数据和操作数据的方法
> + 调用Flux actions并以回调函数的方式给展示型组件提供actions
> + 通常是有状态的，并且作为数据源存在
> + 通常由高阶函数生成例如React Redux的connect()，Realy的createContainer，或者Flux Utils的Container.create(),而不是手写的
> + 例如：UserPage,FollowersSidebar,StoryContainer,FollowedUserList

展示型组件往往是无状态的纯函数组件，容器型组件往往是有状态的纯类组件。

|        | 展示组件 |	容器组件 |
| ------ | ------ | ------ |
| 作用	| 描述如何展现（骨架、样式）|	描述如何运行（数据获取、状态更新）|
|直接使用Redux	| 否 | 是 |
|数据来源	| props	| 监听 Redux state |
|数据修改	| 从 props 调用回调函数 |	向 Redux 派发 actions |
|调用方式	| 手动 |通常由 React Redux 生成 |

技术上讲你可以直接使用 store.subscribe() 来编写容器组件。但不建议这么做的原因是无法使用 React Redux 带来的性能优化。也因此，不要手写容器组件，而使用 React Redux 的 connect() 方法来生成。


### redux middleware 中间件
提供位于action被发起之后，到达reducer之前的扩展点。

### react-redux
### API
<Provider store>：使组件层级中的 connect() 方法都能够获得 Redux store，正常情况下，你的根组件应该嵌套在 <Provider> 中才能使用 connect() 方法。

connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])
连接 React 组件与 Redux store。
连接操作不会改变原来的组件类。
反而返回一个新的已与 Redux store 连接的组件类。
返回值：根据配置信息，返回一个注入了 state 和 action creator 的 React 组件。

[mapStateToProps(state, [ownProps]): stateProps] (Function)：
> 监听Redux Store的变化；该函数返回一个纯对象，这个对象会与组件的props合并。
> ownProps是传递到组件的props，只要组件接收到新的 props,mapStateToProps将会被重新计算。

[mapDispatchToProps(dispatch, [ownProps]): dispatchProps] (Object or Function)：
> [mapDispatchToProps(dispatch, [ownProps]): dispatchProps] (Object or Function): 如果传递的是一个对象，那么每个定义在该对象的函数都将被当作 Redux action creator，对象所定义的方法名将作为属性名；每个方法将返回一个新的函数，函数中dispatch方法会将 action creator 的返回值作为参数执行。这些属性会被合并到组件的 props 中。
> 如果传递的是一个函数，该函数将接收一个 dispatch 函数，然后由你来决定如何返回一个对象，这个对象通过 dispatch 函数与 action creator 以某种方式绑定在一起（提示：你也许会用到 Redux 的辅助函数 bindActionCreators()。如果你省略这个 mapDispatchToProps 参数，默认情况下，dispatch 会注入到你的组件 props 中。如果指定了该回调函数中第二个参数 ownProps，该参数的值为传递到组件的 props，而且只要组件接收到新 props，mapDispatchToProps 也会被调用

```js
// 常见装饰器写法
@connect(mapStateToProps, mapDispatchToProps)
export default class MyReactComponent extends React.Component {}

// 等同于
class MyReactComponent extends React.Component {}
export default connect(mapStateToProps, mapDispatchToProps)(MyReactComponent);
```





<!-- react相关 -->

### React.PureComponent:
https://react.docschina.org/docs/react-api.html#reactpurecomponent
React.PureComponent 类似于 React.Component。它们的不同之处在于React.Component 没有实现 shouldComponentUpdate()，但是 React.PureComponent实现了它。采用对属性和状态用浅比较的方式。
React.PureComponent 的 shouldComponentUpdate() 只会对对象进行浅对比。如果对象包含复杂的数据结构，它可能会因深层的数据不同而产生漏报判断。仅当你知道拥有的是简单的属性和状态时，才去继承 PureComponent，或者在你知道深层的数据结构已经发生改变时使用 forceUpate()。或者，考虑使用 不可变对象 来促进嵌套数据的快速比较。

### prop-types
props值静态类型校验

### class
1.子类中若不写constructor,则默认会有一个空的构造函数，并且在里面调用super()
```js
class ColorPoint extends Point {
}

// 等同于
class ColorPoint extends Point {
  constructor(...args) {
    super(...args);
  }
}
```
ES7新提案，babel支持转换
2.static静态方法：不会被实例继承，通过类名直接调用；
static静态属性：Class 本身的属性，即Class.propName，而不是定义在实例对象（this）上的属性。
3.实例属性的新写法：
实例属性除了定义在constructor()方法里面的this上面，也可以定义在类的最顶层。这时，不需要在实例属性前面加上this。

ES7 Decorator修饰器
应用：日志管理 / 登录检查



### React.Fragment
为一个组件返回多个元素，并且不在DOM中增加额外节点。
<></> 是 <React.Fragment/> 的语法糖。
但是<></> 语法不能接受键值或属性。
如果你需要一个带 key 的片段，你可以直接使用 <React.Fragment /> 。
ps：自己的理解，有点像vue中的<template></template>

### react-router-dom
Route/Link/Switch/
<Route>：基本职责：在其 path 属性与某个 location 匹配时呈现一些 UI。
渲染内容三种方式:
component: 组件
render(fn): 匹配时调用
children(fn): 无论path是否匹配，都会被调用

ps: 优先级：component > render > children。因此不要在同一个 <Route> 中同时使用两者。

path: 匹配的url路径
exact(bool): path是否完全匹配
strict(bool): path尾部斜杠完全匹配

三个路由属性：match / location / history
<Switch>：用于渲染与路径匹配的第一个子 <Route> 或 <Redirect>。

### props.children
props.children在每个组件上都可用。 它会包含组件的开始和结束标记之间的内容
```js
<Welcome>Hello world!</Welcome>
class Welcome extends React.Component {
  render() {
    return <p>{this.props.children}</p>;
  }
}
// this.props.children会拿到Hello world!
```

### ES6 Generator函数
Generator 函数是一个普通函数，但是有两个特征。
一是，function关键字与函数名之间有一个星号；
二是，函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。
分段执行的，yield表达式是暂停执行的标记，而next方法可以恢复执行。

> 调用Generator函数，返回一个遍历器对象，代表Generator函数的内部指针。
> 以后，每次调用遍历器对象的next方法，就会返回一个有着value和done两个属性的对象。
> value属性表示当前的内部状态的值，是yield语句后面那个表达式的值；done属性是一个布尔值，表示是否遍历结束。

yield语句

1. 遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。
2. 下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。
3. 如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。
4. 如果该函数没有return语句，则返回的对象的value属性值为undefined。

"惰性求值"：yield后面的表达式，不会立即求值，只会在next方法将指针移到这一句话时，才会求值。

### Set 和 Map数据结构
Set：
> 类似于数组，但成员的值都是唯一的
> 加入值的时候，不发生类型转换，所以5和"5"是两个不同的值
> 两个对象总是不相等的

实例属性和方法
> add(value)：添加某个值，返回 Set 结构本身。
> delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
> has(value)：返回一个布尔值，表示该值是否为Set的成员。
> clear()：清除所有成员，没有返回值。

遍历
> keys()：返回键名的遍历器[Set 结构没有键名，只有键值（或者说键名和键值是同一个值），所以keys方法和values方法的行为完全一致。]
> values()：返回键值的遍历器
> entries()：返回键值对的遍历器
> forEach()：使用回调函数遍历每个成员

Map:
> 本质上是键值对的集合（Hash结构），但是键的范围不限于字符串，可以包括任何类型的值都可以当做键。
> Object是"字符串-值"的对应，Map是"值-值"的对应。
> Map 也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。
> 只有对同一个对象的引用，Map 结构才将其视为同一个键。这一点要非常小心。
> Map 的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。
> 如果 Map 的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，Map 将其视为一个键

实例和属性方法：
> size 属性：size属性返回 Map 结构的成员总数。
> set(key, value)：设置键名key对应的键值为value，然后返回整个 Map 结构。如果key已经有值，则键值会被更新，否则就新生成该键。
> get(key)：get方法读取key对应的键值，如果找不到key，返回undefined。
> has(key)：has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。
> delete(key)：delete方法删除某个键，返回true。如果删除失败，返回false。
> clear()：clear方法清除所有成员，没有返回值。

遍历
> keys()：返回键名的遍历器。
> values()：返回键值的遍历器。
> entries()：返回所有成员的遍历器。
> forEach()：遍历 Map 的所有成员。

### react-saga

为了运行我们的 Saga，我们需要：
1. 创建一个 Saga middleware 和要运行的 Sagas（目前我们只有一个 helloSaga）
2. 将这个 Saga middleware 连接至 Redux store.

```js
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { helloSaga } from './sagas'

const store = createStore(
  reducer,
  applyMiddleware(createSagaMiddleware(helloSaga))
)
```


Effects
> 在 redux-saga 的世界里，Sagas 都用 Generator 函数实现。我们从 Generator 里 yield 纯 JavaScript 对象以表达 Saga 逻辑。 我们称呼那些对象为 Effect。Effect 是一个简单的对象，这个对象包含了一些给 middleware 解释执行的信息。 你可以把 Effect 看作是发送给 middleware 的指令以执行某些操作（调用某些异步函数，发起一个 action 到 store，等等）。

##### call(fn, ...args)：
+ 创建一个 Effect 描述信息，用来命令 middleware 以参数 args 调用函数 fn 。
+ fn: Function - 一个 Generator 函数, 也可以是一个返回 Promise 或任意其它值的普通函数。
+ args: Array<any> - 传递给 fn 的参数数组。

call: 
put: 创建dispatch Effect
takeEvery: 允许多个 fetchData 实例同时启动。
takeLatest: 任何时刻 takeLatest 只允许一个 fetchData 任务在执行。并且这个任务是最后被启动的那个。 如果已经有一个任务在执行的时候启动另一个 fetchData ，那之前的这个任务会被自动取消。
take: 它创建另一个命令对象，告诉 middleware 等待一个特定的 action。
select: 
fork: 当我们 fork 一个 任务，任务会在后台启动，调用者也可以继续它自己的流程，而不用等待被 fork 的任务结束。（返回一个Task Object）
cancel: 取消fork任务。
delay: 
组合saga。。。

select: 取store上的state，返回state上的部分数据。
call: 异步请求
put: dispatch一个action
fork: 非阻塞调用的形式执行 fn，返回一个Task对象






Babylon 

入口文件app_dev.js，app.js
HashRouter里Switch组件：
hash路由，渲染与路径匹配的第一个子 <Route>
依次匹配登录（/auth/login），首页（/）,404（/404），其他的就匹配页面。
<AuthRoute>组件传递Layout组件作为props参数；
在Layout组件中，用antd搭建页面结构，然后{this.props.children}的位置是<AsyncSysRoute>组件；
AsyncSysRoute中遍历渲染了指向各个页面的Route组件；
根目录store里聚合了所有reducer，然后createStore了一个总的store。
在app.js中把store传入<Provider>组件，挂载在组件树的根部。

? 拆分的reducer在哪儿被combine的
? saga 在哪儿被连接至 Redux store.



react Class 中fn() 和fn = () => {}的区别：
都是挂载在prototype上的方法，但如果需要传递给子组件，需使用后者。因为前者会造成父组件this的丢失。
为什么要用方法要用箭头函数，防止父组件上下文丢失。
react不支持动态className，用一个库classNames。
react组件上不能传class，style。
react可以传递数组组件。
react-portal传送门。model弹窗常用。 
react.createElement(componentName, props)动态组件。

性能优化相关
shouldComponentsUpdate(nextprops,nextstate): 父组件更新不希望子组件无用更新；渲染依赖第三方库（echart）
immutable.js 不可变更新库，自己做一个shouldComponentsUpdate比较。
<div data-id={} onClick="onClick" />
<div onClick={item => {onClick(item.id)}} /> 二者的区别