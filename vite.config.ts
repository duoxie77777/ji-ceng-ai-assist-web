import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'path'
// element-plus 按需引入插件
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// px 转 rem 插件
import postcssPxtorem from 'postcss-pxtorem'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'mock',           // mock 文件目录
        enable: false, // 禁用 mock，其他接口对接真实后端
        logger: true,               // 控制台显示请求日志
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    server: {
      port: 5173,  // 固定端口为 5173
      strictPort: true,  // 如果端口被占用则直接失败
      proxy: {
        '/api': {
          target: 'http://localhost:3000',  // 后端 API 服务器地址
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),  // 如果需要去掉 /api 前缀
        },
        '/uploads': {
          target: 'http://localhost:3000',  // 后端文件服务器地址
          changeOrigin: true,
        },
      },
    },
    // 定义全局常量
    define: {
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE),
      __APP_DESCRIPTION__: JSON.stringify(env.VITE_APP_DESCRIPTION),
    },
    // PostCSS 配置
    css: {
      postcss: {
        plugins: [
          postcssPxtorem({
            rootValue: 16,              // 1rem = 16px（与 flexible.ts 保持一致）
            propList: ['*'],            // 所有属性都转换
            selectorBlackList: [        // 不转换的选择器
              'html',                   // html 标签不转换
              /^el-/,                   // Element Plus 组件不转换
            ],
            exclude: /node_modules/i,   // 排除 node_modules
            mediaQuery: false,          // 不转换媒体查询中的 px
            minPixelValue: 1,           // 小于 1px 的不转换
          }),
        ],
      },
    },
  }
})