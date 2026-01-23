import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/menu/menu'
import router from '@/router'

// 视图组件映射
const viewModules = import.meta.glob('@/views/**/*.vue')

/**
 * 将菜单数据转换为路由配置
 * @param menuList 菜单列表
 * @returns 路由配置数组（包含 BasicLayout 包裹）
 */
export function transformMenuToRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  const childRoutes = menuList.map(menu => ({
    path: menu.path,
    name: menu.name,
    component: loadViewComponent(menu.component),
    meta: {
      title: menu.meta.title,
      icon: menu.meta.icon,
      keepAlive: menu.meta.keepAlive ?? false
    }
  }))

  // 返回包含 BasicLayout 的路由配置
  return [
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
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
  // 标准化路径
  let path = componentPath
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  if (!path.endsWith('.vue')) {
    path = path + '.vue'
  }

  const fullPath = `/src/views${path}`
  
  // 返回组件加载函数
  return () => {
    const component = viewModules[fullPath]
    if (!component) {
      console.error(`组件路径不存在: ${fullPath}`)
      // 返回 404 页面
      return import('@/views/error/404.vue')
    }
    return component()
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

  // 添加 404 兜底路由（必须在所有路由之后添加）
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/error/404'
  })
}

/**
 * 重置动态路由（用于退出登录）
 */
export function resetDynamicRoutes(): void {
  // 由于 Vue Router 4 没有提供直接的重置方法
  // 通常在退出登录时刷新页面以清除动态路由
  window.location.reload()
}
