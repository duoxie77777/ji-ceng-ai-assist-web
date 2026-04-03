export interface Notice {
  title: string
  time: string
  isRead: boolean
}

export interface Task {
  name: string
  count: number
  percent: number
  icon: string
  iconColor: string
  barColor: string
  textColor: string
}

export interface QuickFunc {
  name: string
  icon: string
  bgColor: string
}

export interface EnterpriseStat {
  label: string
  count: number
  percent: number
  color: string
}