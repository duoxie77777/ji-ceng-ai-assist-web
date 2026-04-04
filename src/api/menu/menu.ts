import { menuList } from '../../../mock/menu'

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

export const menuApi = {
  getMenuList: () => Promise.resolve(menuList)
}
