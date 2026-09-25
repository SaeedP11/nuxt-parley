import type { NuxtApp } from '#app'
import type { ParleyConfig } from './config'
import { createChat } from './parley'

/** Called by the generated `parley` plugin once Pinia and vue-i18n are installed. */
export async function installParley(nuxtApp: NuxtApp, config: ParleyConfig | null): Promise<void> {
  if (!config) return
  nuxtApp.vueApp.use(createChat(await config(nuxtApp)))
}
