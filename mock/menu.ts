import type { MockMethod } from 'vite-plugin-mock'

// 菜单数据类型定义
export interface MenuItemMock {
  id: string
  path: string
  name: string
  component: string
  meta: {
    title: string
    icon?: string
    keepAlive?: boolean
  }
}

// 模拟菜单数据 - 基于现有页面
const menuList: MenuItemMock[] = [
  {
    id: '1',
    path: '/home',
    name: 'Home',
    component: '/home/index',
    meta: {
      title: '首页',
      icon: 'gongzuotai',
      keepAlive: true
    }
  },
  {
    id: '2',
    path: '/document',
    name: 'Document',
    component: '/document/index',
    meta: {
      title: '文档中心',
      icon: 'wendang-caogao-F',
      keepAlive: true
    }
  }
]

export default [
  // 获取菜单列表接口
  {
    url: '/api/menu/list',
    method: 'get',
    response: ({ headers }: { headers: Record<string, string> }) => {
      const token = headers.authorization?.replace('Bearer ', '')

      // 验证 token
      if (!token || !token.startsWith('mock_token_')) {
        return {
          code: 401,
          data: null,
          message: '未登录或 token 已过期',
        }
      }

      return {
        code: 0,
        data: menuList,
        message: 'success',
      }
    },
  },
] as MockMethod[]
