import { createRequire } from 'node:module'
import {
  addComponent,
  addImports,
  addPlugin,
  addPluginTemplate,
  createResolver,
  defineNuxtModule,
  findPath,
  hasNuxtModule,
  useLogger,
} from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * File, relative to the app's `srcDir` (`app/` in Nuxt 4), whose default export is
   * `defineParleyConfig(...)`: the backend handlers and the signed-in user. `false` leaves
   * installing the chat to you: call `createChat()` from your own plugin.
   * @default 'parley.config'
   */
  config: string | false
  /**
   * Add vue-parley's stylesheet. It is precompiled and scoped to the chat, so the app needs no
   * Tailwind and its own styles are left alone.
   * @default true
   */
  css: boolean
  /**
   * Prefix for the registered components: `'Parley'` registers `<ParleyChatPage>`.
   * @default ''
   */
  prefix: string
  /**
   * Also register the helpers vue-parley exports besides the chat itself: `BIcon` (a Phosphor
   * icon by name), `BEmojiPicker` and `BVirtualVerticalList`. Its controls are PrimeVue
   * components, which come from the app's own PrimeVue setup.
   * @default false
   */
  primitives: boolean
  /**
   * Locale for the chat when the app has no `@nuxtjs/i18n`; the module then installs vue-i18n
   * itself. With `@nuxtjs/i18n`, the chat follows its locale and this is ignored.
   * @default 'en'
   */
  locale: string
  /** @default 'en' */
  fallbackLocale: string
}

export type { ParleyConfig } from './runtime/config'
// Types only, named one by one: `export type *` is emitted as `export *`, which would claim this
// build-time entry also exports vue-parley's runtime values.
export type {
  CallHandlers,
  CallKind,
  CallMessage,
  CallMessageSchema,
  CallPublishOptions,
  ChatFilter,
  ChatHandlers,
  ChatOptions,
  ChatUser,
  Contact,
  ContactsPage,
  Credential,
  ExtendedMessage,
  FetchContactsParams,
  FetchMessagesParams,
  FetchProfileAttachmentsParams,
  MediaDownloadOptions,
  MediaHandlers,
  Message,
  MessagesHandlers,
  MessageType,
  ProfileAttachmentsPage,
  ProfileHandlers,
  SendMessageOptions,
  SignalData,
  TurnConfig,
  UploadProgressEvent,
} from 'vue-parley'

const MODULE_NAME = 'nuxt-parley'

/** Registered name → vue-parley export. `Call` would claim a very generic tag, hence `ChatCall`. */
const COMPONENTS: Record<string, string> = {
  ChatPage: 'ChatPage',
  ChatList: 'ChatList',
  ChatConversation: 'ChatConversation',
  ChatHeader: 'ChatHeader',
  ChatMessages: 'ChatMessages',
  ChatInput: 'ChatInput',
  ChatBubble: 'ChatBubble',
  ChatCall: 'Call',
}

const PRIMITIVES = ['BEmojiPicker', 'BIcon', 'BVirtualVerticalList']

const COMPOSABLES = [
  'useChatStore',
  'useMessagesStore',
  'useMediaStore',
  'useProfileStore',
  'useCallStore',
  'provideCallHandlers',
]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'parley',
    compatibility: { nuxt: '>=4.0.0' },
  },
  moduleDependencies: {
    '@pinia/nuxt': {},
  },
  defaults: {
    config: 'parley.config',
    css: true,
    prefix: '',
    primitives: false,
    locale: 'en',
    fallbackLocale: 'en',
  },
  async setup(options, nuxt) {
    const logger = useLogger(MODULE_NAME)
    const { resolve } = createResolver(import.meta.url)
    const parley = resolve('./runtime/parley')

    if (options.css) {
      // Resolved from here, not left as `vue-parley/style.css`: under pnpm the app itself cannot
      // see vue-parley, only this module can.
      nuxt.options.css.push(createRequire(import.meta.url).resolve('vue-parley/style.css'))
    }

    // Client-only: the chat needs IndexedDB, WebRTC and the camera, and its handlers are only
    // installed in the browser. The server renders a placeholder, so pages need no <ClientOnly>.
    const names = [
      ...Object.entries(COMPONENTS),
      ...(options.primitives ? PRIMITIVES.map(name => [name, name]) : []),
    ]
    for (const [name, exportName] of names) {
      addComponent({ name: `${options.prefix}${name}`, export: exportName, filePath: parley, mode: 'client' })
    }

    addImports([
      ...COMPOSABLES.map(name => ({ name, from: parley })),
      { name: 'defineParleyConfig', from: resolve('./runtime/config') },
    ])

    nuxt.options.runtimeConfig.public.parley = {
      locale: options.locale,
      fallbackLocale: options.fallbackLocale,
    }

    const configPath = options.config
      ? await findPath(createResolver(nuxt.options.srcDir).resolve(options.config))
      : null
    // Not while preparing types: that also runs in this module's own root, which has no app.
    if (options.config && !configPath && !nuxt.options._prepare) {
      logger.warn(
        `No \`${options.config}\` in ${nuxt.options.srcDir}, so the chat has no backend. `
        + 'Create it with `export default defineParleyConfig(...)`, or set `parley.config: false` '
        + 'and call `createChat()` from your own plugin.',
      )
    }

    // The plugin imports the config file directly, so creating or deleting it needs a restart.
    if (options.config) {
      const config = options.config
      nuxt.hook('builder:watch', async (event, path) => {
        if ((event === 'add' || event === 'unlink') && path.replace(/\.[cm]?[jt]s$/, '').endsWith(config)) {
          await nuxt.callHook('restart')
        }
      })
    }

    // Decided once every module is installed, so the order of `modules` does not matter.
    nuxt.hook('modules:done', () => {
      const hasI18n = hasNuxtModule('@nuxtjs/i18n', nuxt)
      if (!hasI18n) {
        addPlugin({ src: resolve('./runtime/plugins/i18n'), mode: 'client' })
      }

      // vue-parley's UI is PrimeVue, themed by the app's preset, and `createChat()` refuses to run
      // without it. The module leaves PrimeVue to the app, so an app that already has it keeps its
      // own setup and theme.
      if (options.config && !hasNuxtModule('@primevue/nuxt-module', nuxt) && !nuxt.options._prepare) {
        logger.warn(
          'vue-parley needs PrimeVue 4. Add `@primevue/nuxt-module` with a theme preset, or install '
          + 'PrimeVue from a plugin of your own and set `parley.config: false`, calling `createChat()` '
          + 'after it.',
        )
      }

      // A template rather than a runtime file: Nuxt reads `dependsOn` from the plugin's source at
      // build time, and the i18n plugin to wait for depends on the app. Appended, so it runs after
      // every module's plugins: PrimeVue's has no name to wait for, and must be installed first.
      addPluginTemplate({
        filename: 'parley.client.mjs',
        mode: 'client',
        getContents: () => [
          `import { defineNuxtPlugin } from '#app'`,
          `import { installParley } from ${JSON.stringify(resolve('./runtime/install'))}`,
          configPath ? `import config from ${JSON.stringify(configPath)}` : 'const config = null',
          '',
          'export default defineNuxtPlugin({',
          `  name: 'parley',`,
          `  dependsOn: ${JSON.stringify(['pinia', hasI18n ? 'i18n:plugin' : 'parley:i18n'])},`,
          '  setup: nuxtApp => installParley(nuxtApp, config),',
          '})',
          '',
        ].join('\n'),
      }, { append: true })
    })
  },
})
