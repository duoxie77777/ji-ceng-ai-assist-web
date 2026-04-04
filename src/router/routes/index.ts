import type { RouteRecordRaw } from 'vue-router'

/**
 * 静态路由配置
 * 注意：动态路由会在登录后通过路由守卫动态添加
 */
const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: '登录'
        }
    },
    {
        path: '/error/404',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: {
            title: '页面不存在'
        }
    },
    {
        path: '/error/403',
        name: 'Forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: {
            title: '无权限'
        }
    }
]

export default routes
