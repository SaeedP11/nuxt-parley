// Everything the app gets from vue-parley goes through this file: components, auto-imports and the
// plugin. A bare `vue-parley` import from here resolves against this module's own dependencies, so
// an app that only installs nuxt-parley still works under pnpm's strict layout, and dev never ends
// up with two copies of the stores (one imported by path, one prebundled).
export {
  Call,
  ChatBubble,
  ChatConversation,
  ChatHeader,
  ChatInput,
  ChatList,
  ChatMessages,
  ChatPage,
  BEmojiPicker,
  BIcon,
  BVirtualVerticalList,
  createChat,
  messageMedia,
  provideCallHandlers,
  resetChat,
  useCallStore,
  useChatStore,
  useMediaStore,
  useMessagesStore,
  useProfileStore,
} from 'vue-parley'
