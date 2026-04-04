import type { Router } from 'vue-router'
import { menuApi } from '@/api/menu/menu'
import { transformMenuToRoutes, addDynamicRoutes } from '@/router/utils/dynamicRoutes'

// Token 存储键名（与 request 拦截器保持一致）
const TOKEN_KEY = 'token'

// 白名单路由（无需登录即可访问）
const WHITE_LIST = ['/login', '/error/404', '/error/403']

// 是否已加载动态路由的标志
let isRoutesLoaded = false

/**
 * 设置权限路由守卫
 * @param router 路由实例
 */
export function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // 获取 token
    const token = localStorage.getItem(TOKEN_KEY)

    // 白名单路由直接放行
    if (WHITE_LIST.includes(to.path)) {
      next()
      return
    }

    // 未登录，重定向到登录页
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 已登录，检查是否已加载动态路由
    if (!isRoutesLoaded) {
      try {
        // 获取菜单并生成动态路由
        const menuList = await menuApi.getMenuList()
        const routes = transformMenuToRoutes(menuList)
        addDynamicRoutes(routes)

        // 标记为已加载
        isRoutesLoaded = true

        // 重新导航到目标页面（replace: true 避免在历史记录中留下记录）
        next({ ...to, replace: true })
      } catch (error) {
        console.error('加载动态路由失败:', error)
        // 清除 token 并跳转到登录页
        localStorage.removeItem(TOKEN_KEY)
        isRoutesLoaded = false
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      // 已加载路由，直接放行
      next()
    }
  })
}

/**
 * 重置路由加载状态（用于退出登录）
 */
export function resetPermissionGuard() {
  isRoutesLoaded = false
}
