import type { MockMethod } from 'vite-plugin-mock';
import type { MenuItem } from "@/api/menu/menu.ts";
// 模拟菜单数据 - 基于现有页面
export const menuList: MenuItem[] = [
  {
    id: '1',
    path: '/home',
    name: 'Home',
    component: '/home/index',
    meta: {
      title: '工作台',
      icon: 'gongzuotai',
      keepAlive: true
    }
  },
  {
    id: '2',
    path: '/task',
    name: 'Task',
    component: '/task/index',
    meta: {
      title: '任务中心',
      icon: 'renwu',
      keepAlive: true
    }
  },
  {
    id: '3',
    path: '/document',
    name: 'Document',
    component: '/document/index',
    meta: {
      title: '在线文档',
      icon: 'wendang-caogao-F',
      keepAlive: true
    },
    children: [
      {
        id: '3-1',
        path: 'word',
        name: 'Word',
        component: '/document/components/documentContent/Word/index',
        meta: {
          title: 'Word文档',
          keepAlive: true
        }
      }
    ]
  },
  {
    id: '4',
    path: '/meeting',
    name: 'Meeting',
    component: '/meeting/index',
    meta: {
      title: '会议中心',
      icon: 'huiyi',
      keepAlive: true
    }
  },
  {
    id: '5',
    path: '/contacts',
    name: 'Contacts',
    component: '/contacts/index',
    meta: {
      title: '通讯录',
      icon: 'tongxunlu',
      keepAlive: true
    }
  },
  {
    id: '6',
    path: '/message',
    name: 'Message',
    component: '/message/index',
    meta: {
      title: '消息中心',
      icon: 'gonggao',
      keepAlive: true
    }
  },
  {
    id: '7',
    path: '/approval',
    name: 'Approval',
    component: '/approval/index',
    meta: {
      title: '审批流转',
      icon: 'shenpi',
      keepAlive: true
    }
  },
  {
    id: '8',
    path: '/profile',
    name: 'Profile',
    component: '/profile/index',
    meta: {
      title: '个人中心',
      icon: 'gerenziliao',
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
