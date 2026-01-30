import type { App } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './modules/user'
import { useThemeStore } from './modules/theme'

const store = createPinia()

export function setupStore(app: App) {
    app.use(store)
}

export { store, useUserStore, useThemeStore }