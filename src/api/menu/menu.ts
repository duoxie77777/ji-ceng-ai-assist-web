import { get } from '@/utils/request'

// 菜单项类型定义
export interface MenuItem {
  id: string
  path: string
  name: string
  component: string
  meta: {
    title: string
    icon?: string
    keepAlive?: boolean
  },
  children?: MenuItem[]
}

// 菜单 API
export const menuApi = {
  // 获取菜单列表
  getMenuList: () => get<MenuItem[]>('/menu/list')
}
