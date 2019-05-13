function* helloWorld() {
  yield 'hello'
  yield 'world'
  return 'end'
}
const hello = helloWorld() // 返回的不是函数运行结果，而是一个指向内部状态的指针对象（遍历器对象）。
console.log(hello.next())
console.log(hello.next())
console.log(hello.next())
console.log(hello.next())

