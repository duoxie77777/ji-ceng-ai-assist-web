/**
 * 时间工具函数集合
 * 提供获取时间戳、格式化时间、时间对象等功能
 */

/**
 * 获取当前时间的时间戳
 * @param type - 时间戳类型：'seconds' 返回秒级时间戳，'milliseconds' 返回毫秒级时间戳（默认）
 * @returns 时间戳数字
 * @example
 * ```ts
 * const timestamp = getCurrentTimestamp() // 1719392468123 (毫秒)
 * const timestampSec = getCurrentTimestamp('seconds') // 1719392468 (秒)
 * ```
 */
export function getCurrentTimestamp(type: 'seconds' | 'milliseconds' = 'milliseconds'): number {
  const timestamp = Date.now()
  return type === 'seconds' ? Math.floor(timestamp / 1000) : timestamp
}

/**
 * 获取格式化的当前时间字符串
 * @param format - 时间格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 * @example
 * ```ts
 * const timeStr = getFormattedCurrentTime() // '2024-06-26 14:31:08'
 * const dateStr = getFormattedCurrentTime('YYYY-MM-DD') // '2024-06-26'
 * const customStr = getFormattedCurrentTime('MM/DD/YYYY HH:mm') // '06/26/2024 14:31'
 * ```
 */
export function getFormattedCurrentTime(format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]

  const timeZoneOffset = -now.getTimezoneOffset() / 60
  const timeZoneStr = `GMT${timeZoneOffset >= 0 ? '+' : ''}${timeZoneOffset}`

  // 替换格式占位符
  return format
    .replace('YYYY', String(year))
    .replace('YY', String(year).slice(-2))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('SSS', milliseconds)
    .replace('WW', weekDay)
    .replace('ZZ', timeZoneStr)
}

/**
 * 时间详细信息对象接口
 */
export interface TimeDetail {
  /** 年份 */
  year: number
  /** 月份 (1-12) */
  month: number
  /** 日期 (1-31) */
  day: number
  /** 小时 (0-23) */
  hours: number
  /** 分钟 (0-59) */
  minutes: number
  /** 秒钟 (0-59) */
  seconds: number
  /** 毫秒 (0-999) */
  milliseconds: number
  /** 星期几 (0-6, 0为星期日) */
  weekDay: number
  /** 星期几的中文名称 */
  weekDayName: string
  /** 时间戳（毫秒） */
  timestamp: number
  /** 时间戳（秒） */
  timestampSec: number
  /** ISO格式字符串 */
  isoString: string
  /** 本地时间字符串 */
  localeString: string
  /** 时区偏移（分钟） */
  timezoneOffset: number
  /** 时区字符串 */
  timezone: string
}

/**
 * 获取当前时间的详细对象
 * @returns 包含各种时间信息的详细对象
 * @example
 * ```ts
 * const detail = getDetailedCurrentTime()
 * console.log(detail.year) // 2024
 * console.log(detail.weekDayName) // '星期三'
 * console.log(detail.isoString) // '2024-06-26T06:31:08.123Z'
 * ```
 */
export function getDetailedCurrentTime(): TimeDetail {
  const now = new Date()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const timeZoneOffset = -now.getTimezoneOffset() / 60

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds(),
    weekDay: now.getDay(),
    weekDayName: weekDays[now.getDay()],
    timestamp: now.getTime(),
    timestampSec: Math.floor(now.getTime() / 1000),
    isoString: now.toISOString(),
    localeString: now.toLocaleString('zh-CN'),
    timezoneOffset: now.getTimezoneOffset(),
    timezone: `GMT${timeZoneOffset >= 0 ? '+' : ''}${timeZoneOffset}`
  }
}

/**
 * 便捷的时间格式化常量
 */
export const TIME_FORMATS = {
  /** 标准日期时间格式 */
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  /** 标准日期格式 */
  DATE: 'YYYY-MM-DD',
  /** 标准时间格式 */
  TIME: 'HH:mm:ss',
  /** 简洁日期格式 */
  SHORT_DATE: 'MM/DD/YYYY',
  /** 带毫秒的格式 */
  DATETIME_MS: 'YYYY-MM-DD HH:mm:ss.SSS',
  /** 中文格式 */
  CHINESE_DATETIME: 'YYYY年MM月DD日 HH时mm分ss秒',
  /** ISO格式 */
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const

// 默认导出所有函数
export default {
  getCurrentTimestamp,
  getFormattedCurrentTime,
  getDetailedCurrentTime,
  TIME_FORMATS
}