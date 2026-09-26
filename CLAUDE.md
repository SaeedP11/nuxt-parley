# nuxt-parley

## UI rule: PrimeVue and Tailwind only

Any UI in this repository, which today means the playground, is built from **PrimeVue**
components and **Tailwind CSS**, and nothing else.

- Every interactive control is a PrimeVue component (`Button`, `SelectButton`, `ToggleButton`,
  `Toolbar`, `Dialog`, ...), never a native `<button>`, `<input>` or `<select>` or a styled
  `<a>`. Tailwind does layout, spacing and responsive behaviour; no hand-written CSS for controls.
- No other UI framework or component library, and no new UI dependency without explicit approval.
- Stay on **PrimeVue 4.x** (`@primevue/nuxt-module` 4.x, `@primeuix/themes` 1.x). PrimeVue 5 is
  commercially licensed and forbids redistribution inside a component library.

## The module stays headless

The module itself (`src/`) adds no UI framework. vue-parley's UI is PrimeVue, but PrimeVue is a
peer dependency the app installs and themes (`@primevue/nuxt-module` in the playground and the
test fixtures). The module only checks for it and warns at build time, and appends its install
plugin so `createChat()` runs after PrimeVue's plugin.

When vue-parley is linked from `../vue-parley`, every package both projects load (`vue`, `pinia`,
`vue-i18n`, `@vueuse/core`, `primevue`) must be listed in the playground's `DEDUPE`, or the chat
ends up with a second copy that never sees the app's stores or PrimeVue config.
