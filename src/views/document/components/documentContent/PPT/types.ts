export interface PPTElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'line' | 'chart' | 'table' | 'video' | 'audio'
  left: number
  top: number
  width: number
  height: number
  rotate: number
  zIndex: number
  groupId?: string
  isLocked?: boolean
  opacity?: number
  name?: string
  link?: string
  
  textContent?: {
    content: string
    fontFamily: string
    fontSize: number
    fontColor: string
    fontWeight: 'normal' | 'bold'
    fontStyle: 'normal' | 'italic'
    textDecoration: 'none' | 'underline' | 'line-through'
    textAlign: 'left' | 'center' | 'right'
    verticalAlign: 'top' | 'middle' | 'bottom'
    lineHeight: number
    wordBreak: 'normal' | 'break-all' | 'break-word'
    fill: string
  }
  
  imageContent?: {
    src: string
    fit: 'fill' | 'contain' | 'cover' | 'none'
    flipH?: boolean
    flipV?: boolean
  }
  
  shapeContent?: {
    path: string
    fill: string
    stroke: string
    strokeWidth: number
    shadow?: {
      h: number
      v: number
      blur: number
      color: string
    }
  }
  
  animations?: PPTAnimation[]
}

export interface PPTAnimation {
  id: string
  type: 'in' | 'out' | 'emphasis'
  effect: string
  duration: number
  delay: number
  trigger: 'click' | 'auto' | 'afterPrevious' | 'withPrevious'
}

export interface PPTSlide {
  id: string
  elements: PPTElement[]
  background: {
    type: 'solid' | 'gradient' | 'image'
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      colors: { offset: number; color: string }[]
      angle?: number
    }
    image?: {
      src: string
      fit: 'fill' | 'contain' | 'cover'
    }
  }
  transition?: {
    type: string
    duration: number
  }
  name?: string
  notes?: string
}

export interface PPTTheme {
  backgroundColor: string
  fontColor: string
  fontName: string
  fontSize: number
}

export interface PPTState {
  title: string
  slides: PPTSlide[]
  activeSlideIndex: number
  activeElementIds: string[]
  theme: PPTTheme
  canvasWidth: number
  canvasHeight: number
  zoom: number
  showGridLines: boolean
  showRuler: boolean
  history: PPTSlide[][]
  historyIndex: number
}

export interface ClipboardData {
  type: 'element' | 'slide'
  data: PPTElement[] | PPTSlide
}

export const CANVAS_WIDTH = 1280
export const CANVAS_HEIGHT = 720
export const DEFAULT_SLIDE_BACKGROUND = {
  type: 'solid' as const,
  color: '#ffffff'
}

export const DEFAULT_THEME: PPTTheme = {
  backgroundColor: '#ffffff',
  fontColor: '#333333',
  fontName: 'Microsoft YaHei',
  fontSize: 18
}

export function createDefaultSlide(): PPTSlide {
  return {
    id: generateId(),
    elements: [],
    background: { ...DEFAULT_SLIDE_BACKGROUND },
    notes: ''
  }
}

export function createTextElement(options: Partial<PPTElement> = {}): PPTElement {
  return {
    id: generateId(),
    type: 'text',
    left: 100,
    top: 100,
    width: 400,
    height: 100,
    rotate: 0,
    zIndex: 1,
    textContent: {
      content: '请输入文本',
      fontFamily: 'Microsoft YaHei',
      fontSize: 24,
      fontColor: '#333333',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.5,
      wordBreak: 'break-word',
      fill: 'transparent'
    },
    ...options
  }
}

export function createImageElement(src: string, options: Partial<PPTElement> = {}): PPTElement {
  return {
    id: generateId(),
    type: 'image',
    left: 100,
    top: 100,
    width: 300,
    height: 200,
    rotate: 0,
    zIndex: 1,
    imageContent: {
      src,
      fit: 'cover'
    },
    ...options
  }
}

export function createShapeElement(shapeType: string, options: Partial<PPTElement> = {}): PPTElement {
  const shapes: Record<string, string> = {
    rect: 'M0,0 L100,0 L100,100 L0,100 Z',
    circle: 'M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0',
    triangle: 'M50,0 L100,100 L0,100 Z',
    star: 'M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z',
    arrow: 'M0,40 L70,40 L70,20 L100,50 L70,80 L70,60 L0,60 Z'
  }
  
  return {
    id: generateId(),
    type: 'shape',
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    rotate: 0,
    zIndex: 1,
    shapeContent: {
      path: shapes[shapeType] || shapes.rect,
      fill: '#4A90E2',
      stroke: '#357ABD',
      strokeWidth: 2
    },
    ...options
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
