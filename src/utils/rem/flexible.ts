// src/utils/flexible.ts

/**
 * rem 自适应布局工具
 * 设计稿宽度：1920px
 * 基准：1rem = 16px（标准浏览器字体大小）
 * 
 * 配合 postcss-pxtorem 插件使用：
 * - 样式中直接写 px，会自动转换为 rem
 * - 例如：width: 1920px → 自动转换为 width: 120rem
 */

// 设计稿宽度
const designWidth = 1920
// 基准字体大小（1rem = 16px）
const baseFontSize = 16

/**
 * 初始化 rem 适配
 */
export function initRem(): void {
  setRem()
  window.addEventListener('resize', debounce(setRem, 100))
  window.addEventListener('orientationchange', setRem)
}

/**
 * 设置根元素字体大小
 */
function setRem(): void {
  const clientWidth = document.documentElement.clientWidth || window.innerWidth
  
  // 计算实际的根字体大小
  // 公式：实际字体大小 = 屏幕宽度 / 设计稿宽度 * 基准字体大小
  const fontSize = (clientWidth / designWidth) * baseFontSize
  
  // 设置根元素字体大小
  document.documentElement.style.fontSize = `${fontSize}px`
  
  // 同时设置 data-dpr（可选，用于高清屏适配）
  const dpr = window.devicePixelRatio || 1
  document.documentElement.setAttribute('data-dpr', String(Math.round(dpr)))
}

/**
 * 防抖函数
 */
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: unknown[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  } as T
}

/**
 * 销毁 rem 适配（可选）
 */
export function destroyRem(): void {
  window.removeEventListener('resize', setRem)
  window.removeEventListener('orientationchange', setRem)
  document.documentElement.style.fontSize = ''
}
