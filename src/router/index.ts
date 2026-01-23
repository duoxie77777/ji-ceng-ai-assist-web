import { createRouter, createWebHistory } from "vue-router";
import type { App } from 'vue'
import routes from './routes/index.ts'
import { setupPermissionGuard } from './guards/permission'

// 创建路由
const router = createRouter({
    history: createWebHistory(),
    routes,
    // 切换滚动
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 设置路由守卫
setupPermissionGuard(router)

// 路由错误处理
router.onError((error) => {
    console.error('路由错误:', error)
})

export function setupRouter(app: App) {
    app.use(router)
}

export default router