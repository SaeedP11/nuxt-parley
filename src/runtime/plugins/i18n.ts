import type { Plugin as VuePlugin } from 'vue'
import { createI18n } from 'vue-i18n'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { Plugin } from '#app'

// When this file is typechecked inside an app with @nuxtjs/i18n, vue-i18n's types are narrowed to
// that app's locales and a plain string no longer fits. This plugin only runs in apps without it.
const createLooseI18n = createI18n as unknown as (options: object) => VuePlugin

// Added only when the app has no @nuxtjs/i18n. vue-parley ships its own translations; all it
// needs from the host is an installed vue-i18n and a locale.
const plugin: Plugin = defineNuxtPlugin({
  name: 'parley:i18n',
  setup(nuxtApp) {
    const { locale, fallbackLocale } = useRuntimeConfig().public.parley as {
      locale: string
      fallbackLocale: string
    }
    nuxtApp.vueApp.use(createLooseI18n({ legacy: false, locale, fallbackLocale, messages: {} }))
  },
})

export default plugin
