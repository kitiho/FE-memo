// 想要实现优化，首先得知道什么东西占了这么大的空间
// 1. 将文件分门别类，js,css这些资源目录分别打包到对应的文件夹下
const rollupOptions = {
  build: {
    rollupOptions: {
      output: {
        chunkFilenames: 'js/[name]-[hash].js', // 引入文件
        entryFileNames: 'js/[name]-[hash].js', // 入口文件
        assetFileNames: '[ext]/[name]-[hash].[ext]' // 资源文件
      }
    }
  }
}
  // 2. 查看项目依赖，找出大块头
  // rollup-plugin-visualizer是一个打包体积分析插件，对应webpack中的webpack-bundle-analyzer。配置好后运行构建命令会生成一个stats.html。
  `npm i rollup-plugin-visualizer -D`
import { visualizer } from 'rollup-plugin-visualizer'
const rollupOptions2 = {
  plugins: [
    visualizer({
      open: true
    })
  ]
}
  `npm run build`
// 就能看到体积图了

// 优化
// 拆分包
// 如果不同模块使用的插件基本相同，那就尽可能打包在同一个文件中，减少http请求。
// 如果不同模块使用不同插件，那就分成不同模块打包。
// 这是一个矛盾体，这里使用的是最小化拆分包。如果是前者可以直接选择返回vendor

const rollupOptions3 = {
  output: {
    manualChunks(id) {
      if (id.includes('node_modules')) {
        // 让每个插件都打包成独立的文件 
        return id.toString().split('node_modules/')[1].split('/')[0].toString()
      }
    }
  }
}

  // 去除debugger
  `npm i terser -D`
const rollupOptions4 = {
  terserOptions: {
    compress: {
      drop_debugger: true,
      drop_console: true
    }
  }
}

  // CDN加速
  // 内容分发网络就是让用户从最近的服务器请求资源，提升网络请求的响应速度。同时减少应用打包出来的包体积，利用浏览器缓存，不会变动的文件长期缓存。
  `npm i rollup-plugin-external-globals -D`
  `npm i vite-plugin-html -D`
{/* 
<head>
  <%- vuescript %>
</head>
 */}
import { createHtmlPlugin } from 'vite-plugin-html'
const rollupOptions5 = {
  // 告诉打包工具在external配置的都是外部依赖项，不需要打包
  external: ['vue'],
  plugins: [
    externalGlobals({
      // "在项目中引入的变量名称":"CDN包导出的名称，一版在CDN包中都是可见的"
      vue: 'Vue'
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          vuescript: '<script src="https://cdn.bootcdn.net/ajax/libs/vue/3.0.11/vue.global.prod.js"></script>'
        }
      }
    })
  ]
}
// 如果CDN挂了，就会导致项目无法运行，所以需要做一个判断，如果CDN挂了就使用本地的包




//  按需导入
// 明明是同一个包，为什么即出现了lodash又出现了lodash-es，这是因为lodash-es是按需导入的，只导入了需要的模块，而lodash是导入了所有的模块。
// lodash最大的缺陷就是无法按需导入。

import _ from 'lodash-es' // 你会把整个lodash的库都引入进来
import { cloneDeep } from 'lodash-es' // 你只会把lodash中的cloneDeep方法引入进来
// 项目中用到lodash的地方也不多，经过手动修改一下就看不到lodash的库里

// 文件压缩
`npm install vite-plugin-compression -D`
const rollupOptions6 = {
  plugins: [
    viteCompression({
      verbose: true, // 是否在控制台中输出压缩结果
      disable: false, // 是否禁用插件
      threshold: 10240, // 阈值，如果体积大于阈值将被压缩，单位为b，体积过小不建议压缩
      algorithm: 'gzip', // 压缩算法，支持gzip, brotlicompress, deflate, deflateRaw
      ext: '.gz', // 压缩后的文件后缀名
      deleteOriginFile: true // 是否删除原文件
    }),
  ]
}

  // 图片压缩
  `npm i vite-plugin-imagemin -D`
import viteImagemin from 'vite-plugin-imagemin'
const rollupOptions7 = {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    }),
  ]
}
// viteImagemin在国内比较难安装，容易出现报错，可以尝试以下方案
// 只用yarn在package，json内配置
// "resolutions": {
//   "bin-wrapper": "npm:bin-wrapper-china",
// }

// 使用npm，在电脑host文件加上如下配置
// 199.232.4.133 raw.githubusercontent.com

// 使用cnpm（不推荐）

// 官方更建议使用默认的esbuild而不是terser，也支持去除debugger和console
const rollupOptions8 = {
  esbuild: {
    drop: ['console', 'debugger']
  }
}
