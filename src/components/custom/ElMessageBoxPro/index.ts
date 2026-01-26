import { ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
import { h, render } from 'vue'
import ElMessageBoxProView from './ElMessageBoxProView.vue'

/**
 * 确认对话框配置选项
 */
export interface ConfirmOptions {
  /** 标题 */
  title?: string
  /** 消息内容 */
  message: string | any
  /** 类型 */
  type?: 'success' | 'warning' | 'info' | 'error'
  /** 确认按钮文字 */
  confirmButtonText?: string
  /** 取消按钮文字 */
  cancelButtonText?: string
  /** 是否显示取消按钮 */
  showCancelButton?: boolean
  /** 是否显示为危险操作 */
  dangerouslyUseHTMLString?: boolean
  /** 自定义图标 */
  icon?: any
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void | Promise<void>
}

/**
 * 提示对话框配置选项
 */
export interface AlertOptions {
  /** 标题 */
  title?: string
  /** 消息内容 */
  message: string | any
  /** 类型 */
  type?: 'success' | 'warning' | 'info' | 'error'
  /** 确认按钮文字 */
  confirmButtonText?: string
  /** 是否显示为危险操作 */
  dangerouslyUseHTMLString?: boolean
  /** 自定义图标 */
  icon?: any
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>
}

/**
 * 二次封装的MessageBox工具类
 * 基于Element Plus的ElMessageBox进行封装，提供更简洁的API和统一的配置
 */
export const ElMessageBoxPro = {
  /**
   * 显示确认对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  confirm(options: ConfirmOptions): Promise<Action> {
    const {
      title = '提示',
      message,
      type = 'warning',
      confirmButtonText = '确定',
      cancelButtonText = '取消',
      showCancelButton = true,
      dangerouslyUseHTMLString = false,
      icon,
      onConfirm,
      onCancel
    } = options

    return ElMessageBox.confirm(message, title, {
      confirmButtonText,
      cancelButtonText,
      showCancelButton,
      type,
      dangerouslyUseHTMLString,
      icon,
      beforeClose: async (action: Action, instance, done) => {
        if (action === 'confirm') {
          try {
            await onConfirm?.()
            done()
          } catch (error) {
            // 如果onConfirm抛出错误，不关闭弹窗
            console.error('Confirm callback error:', error)
          }
        } else {
          try {
            await onCancel?.()
            done()
          } catch (error) {
            console.error('Cancel callback error:', error)
          }
        }
      }
    })
  },

  /**
   * 显示成功确认对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  confirmSuccess(options: Omit<ConfirmOptions, 'type'>): Promise<Action> {
    return this.confirm({ ...options, type: 'success' })
  },

  /**
   * 显示警告确认对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  confirmWarning(options: Omit<ConfirmOptions, 'type'>): Promise<Action> {
    return this.confirm({ ...options, type: 'warning' })
  },

  /**
   * 显示错误确认对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  confirmError(options: Omit<ConfirmOptions, 'type'>): Promise<Action> {
    return this.confirm({ ...options, type: 'error' })
  },

  /**
   * 显示信息确认对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  confirmInfo(options: Omit<ConfirmOptions, 'type'>): Promise<Action> {
    return this.confirm({ ...options, type: 'info' })
  },

  /**
   * 显示提示对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  alert(options: AlertOptions): Promise<Action> {
    const {
      title = '提示',
      message,
      type = 'info',
      confirmButtonText = '确定',
      dangerouslyUseHTMLString = false,
      icon,
      onConfirm
    } = options

    return ElMessageBox.alert(message, title, {
      confirmButtonText,
      type,
      dangerouslyUseHTMLString,
      icon,
      callback: (action: Action) => {
        if (action === 'confirm') {
          onConfirm?.()
        }
      }
    })
  },

  /**
   * 显示成功提示对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  alertSuccess(options: Omit<AlertOptions, 'type'>): Promise<Action> {
    return this.alert({ ...options, type: 'success' })
  },

  /**
   * 显示警告提示对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  alertWarning(options: Omit<AlertOptions, 'type'>): Promise<Action> {
    return this.alert({ ...options, type: 'warning' })
  },

  /**
   * 显示错误提示对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  alertError(options: Omit<AlertOptions, 'type'>): Promise<Action> {
    return this.alert({ ...options, type: 'error' })
  },

  /**
   * 显示信息提示对话框
   * @param options 配置选项
   * @returns Promise<Action>
   */
  alertInfo(options: Omit<AlertOptions, 'type'>): Promise<Action> {
    return this.alert({ ...options, type: 'info' })
  },

  /**
   * 显示自定义内容的对话框
   * @param options 配置选项
   * @param renderContent 渲染函数，返回VNode
   * @returns Promise<Action>
   */
  custom(
    options: {
      title?: string
      width?: string | number
      confirmButtonText?: string
      cancelButtonText?: string
      showCancelButton?: boolean
    },
    renderContent: (h: any) => any
  ): Promise<Action> {
    const {
      title = '提示',
      width = '400px',
      confirmButtonText = '确定',
      cancelButtonText = '取消',
      showCancelButton = true
    } = options

    // 创建容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 渲染VNode
    const vnode = h(ElMessageBoxProView, null, () => renderContent(h))
    render(vnode, container)

    return ElMessageBox({
      title,
      message: container,
      width,
      confirmButtonText,
      cancelButtonText,
      showCancelButton,
      dangerouslyUseHTMLString: true,
      beforeClose: (action: Action, instance, done) => {
        // 清理DOM
        render(null, container)
        document.body.removeChild(container)
        done()
      }
    })
  },

  /**
   * 关闭所有MessageBox
   */
  close(): void {
    ElMessageBox.close()
  }
}

// 默认导出
export default ElMessageBoxPro