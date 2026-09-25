import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n'],

  // SSR stays on: it is what proves the chat's client-only boundary holds.
  ssr: true,

  devtools: { enabled: true },
  compatibilityDate: 'latest',

  // vue-parley is linked from ../vue-parley (see "Developing against a local vue-parley" in the
  // README). A linked package resolves imports from its own node_modules, which has its own Vue,
  // Pinia and vue-i18n; two of those in one app means two sets of stores. Deduping makes every
  // import use this project's copies. Harmless when vue-parley comes from the registry.
  vite: {
    resolve: {
      dedupe: ['vue', 'pinia', 'vue-i18n', '@vueuse/core'],
    },
    server: {
      // The link resolves outside this project, which Vite's dev server refuses to serve otherwise.
      fs: { allow: [fileURLToPath(new URL('../../vue-parley', import.meta.url))] },
    },
  },

  // The same dedupe for the typechecker: vue-parley's declarations would otherwise pull in a
  // second `vue`, and augmentations such as vue-i18n's `$t` land on the wrong one.
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: Object.fromEntries(
          ['vue', 'pinia', 'vue-i18n', '@vueuse/core'].flatMap((name) => {
            const dir = fileURLToPath(new URL(`../node_modules/${name}`, import.meta.url))
            return [[name, [dir]], [`${name}/*`, [`${dir}/*`]]]
          }),
        ),
      },
    },
  },

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
