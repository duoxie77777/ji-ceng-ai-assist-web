import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/menu/menu'
import router from '@/router'

// 预定义关键页面的动态加载函数
const componentLoaders: Record<string, () => Promise<any>> = {
  '/home/index': () => import('@/views/home/index.vue'),
  '/task/index': () => import('@/views/task/index.vue'),
  '/document/index': () => import('@/views/document/index.vue'),
  '/document/components/documentContent/Word/index': () => import('@/views/document/components/documentContent/Word/index.vue'),
  '/document/components/documentContent/Excel/index': () => import('@/views/document/components/documentContent/Excel/index.vue'),
  '/document/components/documentContent/PPT/index': () => import('@/views/document/components/documentContent/PPT/index.vue'),
  '/document/components/documentContent/CollectionForm/index': () => import('@/views/document/components/documentContent/CollectionForm/index.vue'),
  '/document/components/documentContent/FlowChart/index': () => import('@/views/document/components/documentContent/FlowChart/index.vue'),
  '/document/components/documentContent/MindMap/index': () => import('@/views/document/components/documentContent/MindMap/index.vue'),
  '/meeting/index': () => import('@/views/meeting/index.vue'),
  '/meeting/room/:roomId': () => import('@/views/meeting/room/index.vue'),
  '/contacts/index': () => import('@/views/contacts/index.vue'),
  '/message/index': () => import('@/views/message/index.vue'),
  '/approval/index': () => import('@/views/approval/index.vue'),
  '/profile/index': () => import('@/views/profile/index.vue'),
}

/**
 * 递归解析菜单数据，转换为路由配置（支持嵌套）
 * @param menuList 菜单列表（一级或子级）
 * @returns 对应的路由配置数组
 */
function recursiveMenuToRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  return menuList.map(menu => {
    // 移除 path 的前导斜杠，使其成为相对路径
    const routePath = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path

    const route: RouteRecordRaw = {
      path: routePath,
      name: menu.name,
      component: loadViewComponent(menu.component),
      meta: {
        title: menu.meta?.title || menu.name,
        icon: menu.meta?.icon || menu.icon,
        keepAlive: menu.meta?.keepAlive ?? false
      }
    }

    if (menu.children && menu.children.length > 0) {
      route.children = recursiveMenuToRoutes(menu.children)
    }

    return route
  })
}

/**
 * 将菜单数据转换为路由配置（包含 BasicLayout 包裹）
 * @param menuList 菜单列表
 * @returns 路由配置数组
 */
export function transformMenuToRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  const childRoutes = recursiveMenuToRoutes(menuList)

  return [
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
      redirect: childRoutes[0]?.path || 'home',
      children: childRoutes
    }
  ]
}

/**
 * 动态加载视图组件
 * @param componentPath 组件路径
 * @returns 异步组件加载函数
 */
function loadViewComponent(componentPath: string) {
  // 如果 componentPath 为空，返回 404 页面
  if (!componentPath) {
    console.warn('Component path is empty, returning 404')
    return () => import('@/views/error/404.vue')
  }

  console.log('Loading component:', componentPath)

  // 使用预定义的加载函数
  let loader = componentLoaders[componentPath]

  if (loader) {
    return loader
  }

  // 如果没有预定义，尝试直接加载
  console.warn('Component not in preload list, trying direct import:', componentPath)
  return () => {
    try {
      return import(/* @vite-ignore */ `@/views${componentPath}.vue`)
    } catch (error) {
      console.error('Failed to load component:', error)
      return import('@/views/error/404.vue')
    }
  }
}

/**
 * 添加动态路由到路由实例
 * @param routes 路由配置数组
 */
export function addDynamicRoutes(routes: RouteRecordRaw[]): void {
  routes.forEach(route => {
    router.addRoute(route)
  })

  // 添加 404 通配符路由（放在最后）
  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  })
}

/**
 * 重置动态路由（用于退出登录）
 */
export function resetDynamicRoutes(): void {
  window.location.reload()
}
