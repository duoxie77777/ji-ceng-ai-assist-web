import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PPTSlide, PPTElement, PPTTheme, ClipboardData } from './types'
import { 
  createDefaultSlide, 
  createTextElement, 
  createImageElement, 
  createShapeElement,
  generateId,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_THEME
} from './types'

export const usePPTStore = defineStore('ppt', () => {
  const title = ref('未命名演示文稿')
  const initialSlides = [createDefaultSlide()]
  const slides = ref<PPTSlide[]>(initialSlides)
  const activeSlideIndex = ref(0)
  const activeElementIds = ref<string[]>([])
  const theme = ref<PPTTheme>({ ...DEFAULT_THEME })
  const canvasWidth = ref(CANVAS_WIDTH)
  const canvasHeight = ref(CANVAS_HEIGHT)
  const zoom = ref(1)
  const showGridLines = ref(true)
  const showRuler = ref(false)
  const clipboardData = ref<ClipboardData | null>(null)
  
  const history = ref<PPTSlide[][]>([JSON.parse(JSON.stringify(initialSlides))])
  const historyIndex = ref(0)
  const MAX_HISTORY = 50

  const activeSlide = computed(() => slides.value[activeSlideIndex.value])
  
  const activeElements = computed(() => {
    if (!activeSlide.value) return []
    return activeSlide.value.elements.filter(el => activeElementIds.value.includes(el.id))
  })

  function saveHistory() {
    const currentSlides = JSON.parse(JSON.stringify(slides.value))
    
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    
    history.value.push(currentSlides)
    
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      slides.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      activeElementIds.value = []
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      slides.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      activeElementIds.value = []
    }
  }

  function setActiveSlideIndex(index: number) {
    if (index >= 0 && index < slides.value.length) {
      activeSlideIndex.value = index
      activeElementIds.value = []
    }
  }

  function addSlide(index?: number) {
    saveHistory()
    const newSlide = createDefaultSlide()
    const insertIndex = index !== undefined ? index : activeSlideIndex.value + 1
    slides.value.splice(insertIndex, 0, newSlide)
    activeSlideIndex.value = insertIndex
  }

  function deleteSlide(index: number) {
    if (slides.value.length <= 1) return
    saveHistory()
    slides.value.splice(index, 1)
    if (activeSlideIndex.value >= slides.value.length) {
      activeSlideIndex.value = slides.value.length - 1
    }
    activeElementIds.value = []
  }

  function copySlide(index: number) {
    const slide = slides.value[index]
    if (slide) {
      clipboardData.value = {
        type: 'slide',
        data: JSON.parse(JSON.stringify(slide))
      }
    }
  }

  function pasteSlide() {
    if (clipboardData.value?.type === 'slide') {
      saveHistory()
      const newSlide = JSON.parse(JSON.stringify(clipboardData.value.data))
      newSlide.id = generateId()
      newSlide.elements = newSlide.elements.map((el: PPTElement) => ({
        ...el,
        id: generateId()
      }))
      slides.value.splice(activeSlideIndex.value + 1, 0, newSlide)
      activeSlideIndex.value++
    }
  }

  function moveSlide(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    saveHistory()
    const [slide] = slides.value.splice(fromIndex, 1)
    slides.value.splice(toIndex, 0, slide)
    
    if (activeSlideIndex.value === fromIndex) {
      activeSlideIndex.value = toIndex
    } else if (fromIndex < activeSlideIndex.value && toIndex >= activeSlideIndex.value) {
      activeSlideIndex.value--
    } else if (fromIndex > activeSlideIndex.value && toIndex <= activeSlideIndex.value) {
      activeSlideIndex.value++
    }
  }

  function setActiveElementIds(ids: string[]) {
    activeElementIds.value = ids
  }

  function clearActiveElementIds() {
    activeElementIds.value = []
  }

  function addElement(element: PPTElement) {
    if (activeSlide.value) {
      saveHistory()
      const maxZIndex = Math.max(0, ...activeSlide.value.elements.map(el => el.zIndex))
      element.zIndex = maxZIndex + 1
      activeSlide.value.elements.push(element)
      activeElementIds.value = [element.id]
    }
  }

  function deleteElement(id: string) {
    if (activeSlide.value) {
      saveHistory()
      const index = activeSlide.value.elements.findIndex(el => el.id === id)
      if (index > -1) {
        activeSlide.value.elements.splice(index, 1)
      }
      activeElementIds.value = activeElementIds.value.filter(elId => elId !== id)
    }
  }

  function deleteActiveElements() {
    if (activeSlide.value && activeElementIds.value.length > 0) {
      saveHistory()
      activeSlide.value.elements = activeSlide.value.elements.filter(
        el => !activeElementIds.value.includes(el.id)
      )
      activeElementIds.value = []
    }
  }

  function updateElement(id: string, updates: Partial<PPTElement>, saveHistoryFlag: boolean = false) {
    if (activeSlide.value) {
      const element = activeSlide.value.elements.find(el => el.id === id)
      if (element) {
        if (saveHistoryFlag) {
          saveHistory()
        }
        Object.assign(element, updates)
      }
    }
  }

  function updateActiveElements(updates: Partial<PPTElement>) {
    if (activeSlide.value) {
      saveHistory()
      activeSlide.value.elements.forEach(el => {
        if (activeElementIds.value.includes(el.id)) {
          Object.assign(el, updates)
        }
      })
    }
  }

  function copyElements() {
    if (activeElements.value.length > 0) {
      clipboardData.value = {
        type: 'element',
        data: JSON.parse(JSON.stringify(activeElements.value))
      }
    }
  }

  function pasteElements() {
    if (clipboardData.value?.type === 'element' && activeSlide.value) {
      saveHistory()
      const elements = clipboardData.value.data as PPTElement[]
      const newIds: string[] = []
      
      elements.forEach(el => {
        const newElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: generateId(),
          left: el.left + 20,
          top: el.top + 20
        }
        const maxZIndex = Math.max(0, ...activeSlide.value.elements.map(e => e.zIndex))
        newElement.zIndex = maxZIndex + 1
        activeSlide.value.elements.push(newElement)
        newIds.push(newElement.id)
      })
      
      activeElementIds.value = newIds
    }
  }

  function addTextElement() {
    const element = createTextElement()
    addElement(element)
  }

  function addImageElement(src: string) {
    const element = createImageElement(src)
    addElement(element)
  }

  function addShapeElement(shapeType: string) {
    const element = createShapeElement(shapeType)
    addElement(element)
  }

  function updateSlideBackground(background: PPTSlide['background']) {
    if (activeSlide.value) {
      saveHistory()
      activeSlide.value.background = background
    }
  }

  function setZoom(value: number) {
    zoom.value = Math.max(0.25, Math.min(3, value))
  }

  function toggleGridLines() {
    showGridLines.value = !showGridLines.value
  }

  function toggleRuler() {
    showRuler.value = !showRuler.value
  }

  function moveElementLayer(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
    if (!activeSlide.value) return
    
    const elements = activeSlide.value.elements
    const index = elements.findIndex(el => el.id === id)
    if (index === -1) return
    
    saveHistory()
    const element = elements[index]
    const zIndexes = elements.map(el => el.zIndex).sort((a, b) => a - b)
    
    switch (direction) {
      case 'up':
        element.zIndex = Math.min(element.zIndex + 1, zIndexes[zIndexes.length - 1] + 1)
        break
      case 'down':
        element.zIndex = Math.max(element.zIndex - 1, 0)
        break
      case 'top':
        element.zIndex = zIndexes[zIndexes.length - 1] + 1
        break
      case 'bottom':
        element.zIndex = 0
        elements.forEach(el => {
          if (el.id !== id) el.zIndex++
        })
        break
    }
  }

  function alignElements(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    if (activeElements.value.length < 2) return
    
    saveHistory()
    const elements = activeElements.value
    
    switch (direction) {
      case 'left': {
        const minLeft = Math.min(...elements.map(el => el.left))
        elements.forEach(el => updateElement(el.id, { left: minLeft }))
        break
      }
      case 'center': {
        const centerLeft = elements.reduce((sum, el) => sum + el.left + el.width / 2, 0) / elements.length
        elements.forEach(el => updateElement(el.id, { left: centerLeft - el.width / 2 }))
        break
      }
      case 'right': {
        const maxRight = Math.max(...elements.map(el => el.left + el.width))
        elements.forEach(el => updateElement(el.id, { left: maxRight - el.width }))
        break
      }
      case 'top': {
        const minTop = Math.min(...elements.map(el => el.top))
        elements.forEach(el => updateElement(el.id, { top: minTop }))
        break
      }
      case 'middle': {
        const centerTop = elements.reduce((sum, el) => sum + el.top + el.height / 2, 0) / elements.length
        elements.forEach(el => updateElement(el.id, { top: centerTop - el.height / 2 }))
        break
      }
      case 'bottom': {
        const maxBottom = Math.max(...elements.map(el => el.top + el.height))
        elements.forEach(el => updateElement(el.id, { top: maxBottom - el.height }))
        break
      }
    }
  }

  function initHistory() {
    history.value = [JSON.parse(JSON.stringify(slides.value))]
    historyIndex.value = 0
  }

  return {
    title,
    slides,
    activeSlideIndex,
    activeElementIds,
    theme,
    canvasWidth,
    canvasHeight,
    zoom,
    showGridLines,
    showRuler,
    activeSlide,
    activeElements,
    
    setActiveSlideIndex,
    addSlide,
    deleteSlide,
    copySlide,
    pasteSlide,
    moveSlide,
    
    setActiveElementIds,
    clearActiveElementIds,
    addElement,
    deleteElement,
    deleteActiveElements,
    updateElement,
    updateActiveElements,
    copyElements,
    pasteElements,
    
    addTextElement,
    addImageElement,
    addShapeElement,
    
    updateSlideBackground,
    setZoom,
    toggleGridLines,
    toggleRuler,
    moveElementLayer,
    alignElements,
    
    saveHistory,
    undo,
    redo,
    initHistory
  }
})
