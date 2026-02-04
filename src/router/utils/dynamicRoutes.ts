import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/menu/menu'
import router from '@/router'

// 视图组件映射
const viewModules = import.meta.glob('@/views/**/*.vue')

/**
 * 递归解析菜单数据，转换为路由配置（支持嵌套）
 * @param menuList 菜单列表（一级或子级）
 * @returns 对应的路由配置数组
 */
function recursiveMenuToRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  // 遍历菜单列表，转换为路由配置
  return menuList.map(menu => {
    // 构建当前菜单对应的路由配置（一级或子级）
    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name,
      component: loadViewComponent(menu.component),
      meta: {
        title: menu.meta.title,
        icon: menu.meta.icon,
        keepAlive: menu.meta.keepAlive ?? false
      }
    }

    // 关键：如果当前菜单有 children，递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      route.children = recursiveMenuToRoutes(menu.children) // 递归调用，解析子菜单
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
  // 调用递归函数，生成包含嵌套子路由的一级路由配置
  const childRoutes = recursiveMenuToRoutes(menuList)

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
  window.location.reload()
}