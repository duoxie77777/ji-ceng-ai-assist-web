import type { App } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './modules/user'

const store = createPinia()

export function setupStore(app: App) {
    app.use(store)
}

export { store, useUserStore }