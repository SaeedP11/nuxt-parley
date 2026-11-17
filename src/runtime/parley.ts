// Everything the app gets from vue-parley goes through this file: components, auto-imports and the
// plugin. A bare `vue-parley` import from here resolves against this module's own dependencies, so
// an app that only installs nuxt-parley still works under pnpm's strict layout, and dev never ends
// up with two copies of the stores (one imported by path, one prebundled).
export {
  BEmojiPicker,
  BIcon,
  BVirtualVerticalList,
  Call,
  CallMessageType,
  CallPaintBoard,
  ChatBubble,
  ChatConversation,
  ChatHeader,
  ChatInput,
  ChatList,
  ChatMessages,
  ChatPage,
  createChat,
  messageMedia,
  provideCallHandlers,
  resetChat,
  useCallStore,
  useChatStore,
  useMediaStore,
  useMessagesStore,
  useProfileStore,
  Whiteboard,
  WhiteboardDialog,
  WhiteboardRgbPicker,
} from 'vue-parley'

export * from './composables'
export * from './utils/format'
