// 统一导出所有自定义组件

// ElMessageBoxPro 相关导出
import ElMessageBoxPro, {
  ConfirmOptions,
  AlertOptions,
  ElMessageBoxPro as ElMessageBoxProType
} from './ElMessageBoxPro/index.ts'

// ElInputPro 相关导出
import ElInputPro, {
  ElInputProProps,
  ElInputProInstance,
  install as installElInputPro
} from './ElInputPro/index.ts'

// 导出所有类型
export type {
  ConfirmOptions,
  AlertOptions,
  ElMessageBoxProType,
  ElInputProProps,
  ElInputProInstance
}

// 导出所有组件和工具
export {
  ElMessageBoxPro,
  ElInputPro,
  installElInputPro
}

// 默认导出对象，包含所有自定义组件
default export {
  ElMessageBoxPro,
  ElInputPro
}