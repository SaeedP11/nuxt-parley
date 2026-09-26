import parley from '../../../src/module'

// Listed before @nuxtjs/i18n on purpose: the module must detect it regardless of order.
export default defineNuxtConfig({
  modules: [parley, '@nuxtjs/i18n', '@primevue/nuxt-module'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fa',
    locales: [{ code: 'fa', dir: 'rtl' }, { code: 'en', dir: 'ltr' }],
  },
})
