import type { Router } from 'vue-router'

// 白名单路由
const whiteList = ['/home', '/error/404']

const setupAuthGuard = (router: Router) => {
    router.beforeEach((to, from, next) => {
        const token = localStorage.getItem('token')

        if (token) {
            // 已登录
            if (to.path === '/login') {
                next({ path: '/' })
            } else {
                next()
            }
        } else {
            // 未登录
            if (whiteList.includes(to.path)) {
                next()
            } else if (to.meta.requiresAuth) {
                next({ path: '/login', query: { redirect: to.fullPath } })
            } else {
                next()
            }
        }
    })
}

export { setupAuthGuard }