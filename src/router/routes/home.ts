import type { RouteRecordRaw } from 'vue-router'

const homeRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: '/',
        component: () => import('@/views/home/index.vue'),
        meta: {
            title: "home",
            requiresAuth: true  // 需要登录
        }
    },
]

export default homeRoutes
