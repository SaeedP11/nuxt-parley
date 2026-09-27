# nuxt-parley

Nuxt module for `vue-parley`: a drop-in chat and video-call UI. You write one file with your backend handlers; the module wires up Pinia, i18n, the styles, the components and the auto-imports.

- `<ChatPage />` and the chat's building blocks, registered as client-only components
- The Pinia stores (`useChatStore`, `useCallStore`, ...) auto-imported
- Pinia installed for you (`@pinia/nuxt`)
- Works with `@nuxtjs/i18n` (the chat follows its locale), or installs vue-i18n itself when the app has none
- English and Persian built in, with RTL layout for `fa` and `ar`
- Controls are PrimeVue components, themed by the app's own PrimeVue preset
- Scoped, precompiled CSS: no Tailwind needed, no leaks into the app's styles

## Contents

- [Setup](#setup)
- [The config file](#the-config-file)
- [Components](#components)
- [Auto-imports](#auto-imports)
- [Options](#options)
- [Internationalisation](#internationalisation)
- [Types](#types)
- [Development](#development)

## Setup

```bash
pnpm add nuxt-parley primevue@^4.5 @primevue/nuxt-module@^4.5 @primeuix/themes@^1
```

```ts
// nuxt.config.ts
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  modules: ['nuxt-parley', '@primevue/nuxt-module'],
  primevue: {
    options: { theme: { preset: Aura, options: { darkModeSelector: '.dark' } } },
  },
})
```

vue-parley's buttons, dialogs, menus and the rest are PrimeVue components, so the app provides PrimeVue (4.x) and its theme; an app that already uses PrimeVue keeps its own setup. The module does not install it: it only checks, and warns at build time when `@primevue/nuxt-module` is missing. Installing PrimeVue from a plugin of your own instead works too, with `parley.config: false` and `createChat()` called after it. PrimeVue 5 is not supported (it is no longer MIT-licensed).

Then create `app/parley.config.ts` (see below) and render the chat:

```vue
<template>
  <ChatPage />
</template>
```

Requires Nuxt 4.

## The config file

`app/parley.config.ts` returns what the chat needs from your app: the backend handlers and the signed-in user. It runs once, in the browser, from a Nuxt plugin, so composables such as `useRuntimeConfig()` work inside it, and it may be `async`.

```ts
// app/parley.config.ts
export default defineParleyConfig(async (nuxtApp) => {
  const api = useApi() // your own
  const me = await api.me()

  return {
    chat: {
      /* ChatHandlers: fetch, delete, end conversations */
    },
    messages: {
      /* MessagesHandlers: fetch, send, edit, delete messages */
    },
    media: {
      /* MediaHandlers: download files, file sizes */
    },
    profile: {
      /* optional, ProfileHandlers: the profile panel's media and files tabs */
    },
    call: {
      /* optional, CallHandlers: enables voice and video calls */
    },
    user: { id: me.id, name: me.fullName },
  }
})
```

The handler interfaces are documented in vue-parley's README and exported as types from this module. Creating or deleting the file restarts the dev server; editing it hot-reloads.

To install the chat yourself instead, set `parley: { config: false }` and call `createChat()` from your own client plugin.

### Trying it without a backend

vue-parley ships an in-memory backend for demos and playgrounds. Install `vue-parley` next to this module to import it:

```ts
import { createBroadcastCallHandlers, createFakeBackend, demoData } from 'vue-parley/fakes'

export default defineParleyConfig(() => {
  const backend = createFakeBackend(demoData('me'), { latency: 300 })
  return {
    chat: backend.chat,
    messages: backend.messages,
    media: backend.media,
    profile: backend.profile,
    call: createBroadcastCallHandlers(),
    user: { id: 'me', name: 'Me' },
  }
})
```

See [`playground/app/parley.config.ts`](playground/app/parley.config.ts) for the full version.

## Components

All client-only: the server renders a placeholder, so no `<ClientOnly>` is needed.

| Component | What it is |
| --- | --- |
| `<ChatPage>` | The whole chat: contact list, conversation and call view. Slots: `empty`, `header-actions`, `conversation-top`, `above-input`. |
| `<ChatCall>` | The call view (vue-parley's `Call`). Render it near the app root, with `<ChatPage :render-call="false" />`, to keep a call on screen while the user navigates. |
| `<ChatList>`, `<ChatConversation>`, `<ChatHeader>`, `<ChatMessages>`, `<ChatInput>`, `<ChatBubble>` | Building blocks for a custom layout. |

With `primitives: true`, `BIcon` (a Phosphor icon by name), `BEmojiPicker` and `BVirtualVerticalList` are registered too. The chat's controls are PrimeVue components; use PrimeVue's own `Button`, `Dialog` and so on in your pages. `prefix` prefixes every name.

## Auto-imports

| Name | What it is |
| --- | --- |
| `useChatStore`, `useMessagesStore`, `useMediaStore`, `useProfileStore`, `useCallStore` | vue-parley's Pinia stores. Usable anywhere, including plugins and middleware. |
| `provideCallHandlers(handlers)` | Supplies call handlers from inside a component. |
| `messageMedia(message)` | A message's photo and video album (`media`, or `imageUrl` as photos). Albums are sent with `media`: upload each item, and return it on the message. |
| `defineParleyConfig(fn)` | Typed helper for `app/parley.config.ts`. |

The stores get their handlers from the config file. Used on the server, they exist but have no handlers.

## Options

```ts
export default defineNuxtConfig({
  modules: ['nuxt-parley'],
  parley: {
    config: 'parley.config', // relative to srcDir; false to install the chat yourself
    css: true, // add vue-parley's stylesheet
    prefix: '', // 'Parley' registers <ParleyChatPage>
    primitives: false, // also register BIcon, BEmojiPicker, BVirtualVerticalList
    locale: 'en', // only without @nuxtjs/i18n
    fallbackLocale: 'en', // only without @nuxtjs/i18n
  },
})
```

## Internationalisation

- **With `@nuxtjs/i18n`**, the chat uses its vue-i18n instance and follows its locale; `setLocale('fa')` switches the chat to Persian and right-to-left. The chat's own strings come with vue-parley, so there is nothing to add to your locale files.
- **Without it**, the module installs vue-i18n for the chat, with `parley.locale`. The runtime config key `public.parley.locale` (env `NUXT_PUBLIC_PARLEY_LOCALE`) overrides it.

## Types

The module re-exports vue-parley's types:

```ts
import type { ChatHandlers, Contact, Message } from 'nuxt-parley'
```

## Development

```bash
pnpm install
pnpm dev:prepare  # stub the module and generate types
pnpm dev          # playground at http://localhost:3000
pnpm dev:build    # build the playground
pnpm test         # vitest: builds the fixtures in test/fixtures and checks the rendered pages
pnpm lint
pnpm typecheck
```

The playground (`playground/`) runs on vue-parley's in-memory backend with `@nuxtjs/i18n` (Persian and English), PrimeVue (Aura with vue-parley's teal, in `playground/app/theme.ts`) and Tailwind for its own layout. Open it in two tabs with different `?user=` values (the header has a link), open the same conversation in both and start a call to try video calling.

### Developing against a local vue-parley

The module depends on the published `vue-parley` (`^4.0.0`) from npm. To change both together, link the checkout next to this one by adding an override to `package.json` and running `pnpm install`:

```json
"pnpm": { "overrides": { "vue-parley": "link:../vue-parley" } }
```

Overrides only apply when installing this repository; the published module still depends on the registry version.

With both repositories side by side:

```bash
# in ../vue-parley: rebuild dist/ on every change
pnpm dev

# here
pnpm dev
```

Each rebuild of vue-parley reloads the playground; no reinstall needed.

A linked package resolves its imports from its own `node_modules`, which has its own Vue, Pinia, vue-i18n and PrimeVue (vue-parley's dev dependencies). Two copies of Pinia in one app means two sets of stores, and a second PrimeVue never sees the app's theme, so `playground/nuxt.config.ts` dedupes `vue`, `pinia`, `vue-i18n`, `@vueuse/core` and `primevue` to this project's copies (in Vite, and through tsconfig `paths` for the typechecker), and allows Vite to serve files from `../vue-parley`. That is also why `vue` and `primevue` are dev dependencies here: dedupe resolves from this project.

To go back to the published version, remove the override and run `pnpm install` again.

## License

[MIT](LICENSE)
