import type { NuxtApp } from '#app'
import type { ChatOptions } from 'vue-parley'

/**
 * Returns what `createChat()` needs: the backend handlers and the signed-in user. Runs once, in
 * the browser, inside a Nuxt plugin, so composables such as `useRuntimeConfig()` work here.
 */
export type ParleyConfig = (nuxtApp: NuxtApp) => ChatOptions | Promise<ChatOptions>

/** Typed identity helper for `app/parley.config.ts`. Auto-imported. */
export function defineParleyConfig(config: ParleyConfig): ParleyConfig {
  return config
}
