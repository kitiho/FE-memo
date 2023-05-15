// Node.js 的模块加载方法
// Node.js 有两个模块系统：
// 1. CommonJS 模块
// 2. ES6 模块

// CommonJS 模块
// CommonJS 模块是为 Node.js 打包 JavaScript 代码的原始方式，模块使用 require() 和 module.exports 语句定义。
// 默认情况下，Node.js 会将以下内容视为 CommonJS 模块：
// 扩展名为 .cjs 的文件
// 当最近的父 package.json 文件中 包含 顶层字段 "type: "commonjs" 或 不包含 顶层字段 "type" 时，则应用于扩展名为 .js 的文件
// 当最近的父 package.json 文件包包含顶层字段 "type": "module" 时，对于扩展名不是 .mjs、.cjs、.json、.node 或 .js 的文件，只有当它们通过 require 被加载时才会被认为是 CommonJS 模块，且不是用作程序的命令行入口点

// 加载原理
// CommonJS 的一个模块，就是一个脚本文件，require 命令 第一次加载 脚本时，会 执行整个脚本，然后在内存中 生成一个 Module 对象。

// a.js
var name = "name in a.js"
module.exports = {
  name
}
console.log("module in a.js")
console.log(module)

// index.js
const a = require("./a.js")
console.log('module a in index.js', a)

// 该对象的 id 属性是 模块名
// exports 属性是模块输出的各个 接口
// loaded 属性是一个 布尔值，表示该 模块的脚本是否执行完毕
// children 属性是 当前模块依赖的其他模块集合

// 模块缓存
// CommonJS 模块无论加载多少次，都只会在 第一次加载时运行一次，并生成上面的 Module 对象，以后再加载相同模块，就返回第一次运行的结果，即 Module 对象，除非手动清除系统缓存。
// 可以通过输出 require.cache 查看当前模块的 缓存内容


// a.js
const a1 = require("./a.js")
console.log('first load a.js', a1)

const a2 = require("./a.js")
console.log('second load a.js', a2)

console.log('a1 === a2 =>', a1 === a2)

// index.js
var name = "name in a.js"
console.log("loading a.js")
module.exports = {
  name
}

// 通过上图可以看出，多次加载同一个模块，模块内容只会执行一次，而且得到都是第一次生成的 Module 对象，其中包含了模块输出的各个接口。

// 输出的是值的拷贝
// CommonJS 模块输出的是值的拷贝，一旦输出一个值，模块内部的变化就影响不到这个值。

// index.js
const a = require('./a.js');
console.log('before add in index.js，a.count = ', a.count);
a.add();
console.log('after add in index.js，a.count = ', a.count);

// a.js
let count = 0;

function add() {
  count++;
  console.log('add call in a.js，count = ', count);
}

module.exports = {
  count,
  add
}

// 模块的循环加载
// CommonJS 模块的重要特性是加载时执行，即脚本代码在 require 的时候，就会全部执行，一旦出现某个模块被循环加载，就只输出已经执行的部分，还未执行的部分不会输出。

// main.js
console.log('【【【 main starting 】】】');
const a = require('./a.js');
const b = require('./b.js');
console.log('in main, a.done = %j, b.done = %j', a.done, b.done);
console.log('【【【 main done 】】】');

// a.js
console.log('==== a starting ====');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('==== a done ====');

// b.js
console.log('<<<< b starting >>>>');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('<<<< b done >>>>');

// 核心步骤分析如下：

// main.js 先执行到 const a = require('./a.js'); 时，进入 a 模块并执行

// a.js 中 第二行为模块 添加了 done 属性，即 exports.done = false;，接着执行 const b = require('./b.js'); 时，进入 b 模块并执行
// b.js 中 第二行为模块 添加了 done 属性，即 exports.done = false;，接着执行 const a = require('./a.js'); 此时 发生循环，因此回到 a 模块中，但此时发现 a 模块以及执行过了，因此直接使用是上次的缓存 Module 对象，此时 b 模块中访问 a.done 就是 false，因为 a 模块中没有执行完，即 只输出已经执行部分
// b 模块执行到 exports.done = false; 处，核心步骤已完成并输出，会返回 a 模块中把 未执行完的部分继续执行完成，此时 exports.done = false;

// main.js 后执行到 const b = require('./b.js'); 时，发现 b 模块已经执行过了，于是在这拿到的就是 第一次执行缓存 的 Module 对象，接着在 main.js 访问 a.done 和 b.done 的值就都是 true

// ECMAScript 模块
// ECMAScript 模块 是来打包 JavaScript 代码以供重用的 官方标准格式，模块使用 import 和 export 语句定义。
// 从 Node.js v13.2 版本开始，Node.js 默认打开了对 ECMAScript 模块 的支持

// 加载原理
// ECMAScript 模块的运行机制与 CommonJS 不一样，JS 引擎 在对脚本进行 静态分析 时，只要遇到模块加载命令 import ，就会生成一个 只读引用，等到脚本 真正执行 时，再根据这个 只读引用，去被加载的模块中 取值。

// ECMAScript 模块是 静态分析 阶段生成的 只读引用，因此不好演示具体示例，但可通过下面的例子来验证 只读引用，即相当于通过 const 关键字进行了声明。

// a.mjs
let count = 0

export {
  count
}

// index.mjs
import {count, add} from './a.mjs'

console.log('count = ', count)
count = 1  // 报错
console.log('count = ', count)

// 模块缓存
// ECMAScript 模块 没有使用 CommonJS 模块的 require.cache 缓存方式，因为 ECMAScript 模块加载器有自己独立的缓存。

// a.mjs
console.log('load a.mjs')

// index.mjs
import './a.mjs'
import './a.mjs'

// 输出的是值的引用
// ECMAScript 模块输出的是 值的引用，即 ECMAScript 模块是 动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

// index.mjs
import {count, add} from './a.mjs'

console.log('before add，count = ', count)
add()
console.log('after add，count = ', count)

// a.mjs
let count = 0

let add = () => {
  count++
  console.log('add call in a.mjs，count = ', count)
}

export {
  count,
  add
}

// 模块的循环加载
// ECMAScript 模块处理 "循环加载" 与 CommonJS 模块有本质的不同。
// ES6 模块 是动态引用，如果使用 import 从一个模块加载变量（即import foo from 'foo'），那些变量不会被缓存，而是成为一个 指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值。

// index.mjs
import './a.mjs'

// a.mjs
import {bar} from './b.mjs';
console.log('a.mjs');
console.log(bar);
export let foo = 'foo';

// b.mjs
import {foo} from './a.mjs';
console.log('b.mjs');
console.log(foo);
export let bar = 'bar';

// 详细步骤分析如下：

// 在 index.mjs 中通过 import './a.mjs' 执行 a 模块
// 进入 a.mjs 模块并开始执行，引擎发现它加载 b.mjs，因此会优先执行 b.mjs
// 进入 b.mjs 模块并开始执行，引擎发现 b 又需要加载 a.mjs，并接收了 a 模块中输出的 foo 接口，但此时并不会去执行 a.mjs，而是认为这个接口已经存在了，于是继续往下执行，当执行到 console.log(foo) 处，才发现这个接口根本没定义，因此会产生错误
// 如果 b.mjs 中没有发生异常，那么在执行完 b 模块后，会再返回去执行 a.mjs

// 循环加载报错的解决方案
// 本质原因就是发生 "循环加载" 时，ECMAScript 模块会默认循环模块内容已经执行完成，但是实际是没有执行完成，导致在引用循环模块中的接口时，报错本质上也可以认为是 ES6 中的 暂时性死区 引发的报错。

// 因此，我们可以通过将对应的

//  export let foo = 'foo';
// 的声明方式换为如下的方式：:

// var 的 声明方式

// export var foo = 'foo';，
// 或将 foo 变量换成 函数声明

// export function foo(){ return 'bar'};

// 就可以解决问题，因为它们都具有 "变量提升"，因此，即便 a 模块 没有被执行完，也可以在 b 模块 中正常进行访问，但是要注意使用场景。

// 不同模块的相互加载

// CommonJS 模块加载 ECMAScript 模块
// CommonJS 的 require() 命令不能加载 ECMAScript 模块，这会产生报错，因此只能使用 import() 这个方法加载。
// require() 不支持 ECMAScript 模块的一个原因是，require() 是同步加载，而 ECMAScript 模块内部可以使用顶层 await 命令，导致无法被同步加载。

// a.mjs
let name = 'a.mjs'
export default name

// index.js
(async () => {
  let a = await import('./a.mjs');
  console.log(a);
})();


// ECMAScript 模块加载 CommonJS 模块
// ECMAScript 模块的 import 命令可以加载 CommonJS 模块，但是 只能整体加载，不能只加载单一的输出项。

// a.js
let name = 'a.js'

module.exports = {
  name
}

// index.mjs
import a from './a.js'
console.log(a)

// 这是因为 ECMAScript 模块需要支持 静态代码分析，而 CommonJS 模块的输出接口的 module.exports 是一个对象，无法被静态分析，所以只能整体加载。

// 同时支持两种格式的模块
// 一个模块同时要支持 CommonJS 和 ECMAScript 两种格式，那么需要进行判断：
// 如果原始模块是 ECMAScript 格式，那么需要给出一个整体输出接口，比如 export default obj，使得 CommonJS 可以用 import() 进行加载
// 如果原始模块是 CommonJS 格式，那么可以加一个包装层，即先整体输入 CommonJS 模块，然后再根据 ECMAScript 格式按需要输出具名接口
import cjsModule from '../index.js'; // CommonJS 格式

export const foo = cjsModule.foo; // ECMAScript 格式

// 另一种做法是通过在 package.json 文件中的 exports 字段，指明两种格式 模块各自的 加载入口，下面代码指定 require() 和 import，加载该模块时会自动切换到不同的入口文件

// "exports"：{
//   "require": "./index.js"，
//   "import": "./esm/wrapper.js"
// }

// 总结
// ECMAScript Module 和 CommonJS 的 相同点：

// 拥有 缓存机制，即 多次加载 同一个模块，该模块内容 只会执行一次
// CommonJS 模块内容执行完成后，会生成 Module 对象，同时这个对象会被缓存到 require.cache 对象中
// ECMAScript 模块拥有自己的缓存机制，并使得模块中的变量和该模块进行锁定，保证外部模块可以访问内部变量的最新值

// ECMAScript 模块输出的是一个 只读引用，相当于通过 const 进行声明，意味着不能修改输出接口的引用，但可以修改引用中的内容
// CommonJS 模块默认没有上述的限制，但一般接收模块输出接口时大多都会使用 const 进行声明，此时它们的表现将一致，但如果使用类似 let a = require('./a.js') 的方式加载模块，那么对变量 a 的引用可以随意更改

// ECMAScript Module 和 CommonJS 的 差异点：

// 加载时机不同
// ECMAScript 模块是 编译时输出接口
// CommonJS 模块是 运行时加载

// 加载方式不同
// ECMAScript 模块的 import 命令是 异步加载，有一个独立的模块依赖的解析阶段
// CommonJS 模块的 require() 是 同步加载模块

// 输出结果不同
// ECMAScript 模块输出的是 值的引用
// CommonJS 模块输出的是一个 值的浅拷贝

// 缓存方式不同
// CommonJS 模块通过 require.cache 来对值进行缓存
// ECMAScript 模块拥有自己的缓存机制

// 处理循环加载的方式不同
// CommonJS 模块发生 循环加载 时，只输出已经执行部分，未执行部分不会输出
// ECMAScript 模块发生 循环加载 时，默认 循环加载 模块内部已经执行完毕，对输出接口是否能使用成功需要开发者自己保证
