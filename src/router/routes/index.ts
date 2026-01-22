import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue')
    },
    {
        path: '/error/404',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/error/404'
    }
]

export default routes
