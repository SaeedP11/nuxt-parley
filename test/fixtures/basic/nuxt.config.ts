import parley from '../../../src/module'

// No @nuxtjs/i18n: the module installs vue-i18n itself.
export default defineNuxtConfig({
  modules: [parley, '@primevue/nuxt-module'],
  parley: { locale: 'en' },
})
