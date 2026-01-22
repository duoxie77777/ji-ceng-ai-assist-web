import type { RouteRecordRaw } from 'vue-router'

const errorRoutes: RouteRecordRaw[] = [
    {
        path: '/error',
        name: '/Error',
        redirect: '/error/404',
        children: [
            {
                path: '404',
                name: 'NotFound',
                component: () => import('@/views/error/404.vue'),
                meta: {
                    title: "页面不存在",
                    hidden: true
                }
            },
            {
                path: '403',
                name: 'Forbidden',
                component: () => import('@/views/error/403.vue'),
                meta: {
                    title: "无权限",
                    hidden: true
                }
            }
        ]
    },
]

export default errorRoutes
