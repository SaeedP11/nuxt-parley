export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n'],

  // SSR stays on: it is what proves the chat's client-only boundary holds.
  ssr: true,

  devtools: { enabled: true },
  compatibilityDate: 'latest',

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fa',
    // Always open in Persian, to show the right-to-left layout; the header switches language.
    detectBrowserLanguage: false,
    locales: [
      { code: 'fa', name: 'فارسی', dir: 'rtl' },
      { code: 'en', name: 'English', dir: 'ltr' },
    ],
  },

  // Everything here is a default; spelled out as documentation.
  parley: {
    config: 'parley.config',
    css: true,
    prefix: '',
    primitives: false,
  },
})
