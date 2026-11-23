import type { ComputedRef, WritableComputedRef } from 'vue'
import { computed } from 'vue'
import type { Contact, Message, StateKeys, UploadProgressEvent } from 'vue-parley'
import { resetChat, useChatStore, useMessagesStore, useProfileStore } from '../parley'

export interface UseParleyReturn {
  chatStore: ReturnType<typeof useChatStore>
  messagesStore: ReturnType<typeof useMessagesStore>
  profileStore: ReturnType<typeof useProfileStore>
  activeConversationId: WritableComputedRef<string | null>
  activeContact: ComputedRef<Contact | null>
  activeMessages: ComputedRef<Message[]>
  isLoadingMessages: ComputedRef<boolean>
  draft: WritableComputedRef<string>
  typingUser: ComputedRef<string | null>
  contacts: ComputedRef<readonly Contact[]>
  unreadTotal: ComputedRef<number>
  uploadProgress: ComputedRef<Map<string, UploadProgressEvent>>
  compressionProgress: ComputedRef<Map<string, number>>
  selectConversation: (id: string | null) => void
  getContact: (id: string) => Contact | null
  addContact: (contact: Contact, filter?: StateKeys) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  fetchConversations: (state?: StateKeys, page?: number, search?: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  endConversation: ((id: string) => Promise<void>) | undefined
  setDraft: (channelId: string, text: string) => void
  fetchMessages: (conversationId: string, page?: number) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  cancelSending: (messageId: string) => void
  retryMessage: (messageOrId: Message | string) => void
  reset: () => Promise<void>
}

/**
 * High-level composable for chat conversation and messages state and actions.
 */
export function useParley(): UseParleyReturn {
  const chatStore = useChatStore()
  const messagesStore = useMessagesStore()
  const profileStore = useProfileStore()

  const activeConversationId = computed({
    get: () => chatStore.activeConversationId,
    set: (id: string | null) => chatStore.setSelectedChat(id),
  })

  const activeContact = computed<Contact | null>(() =>
    activeConversationId.value ? chatStore.getContactById(activeConversationId.value) : null,
  )

  const activeMessages = computed<Message[]>(() =>
    activeConversationId.value ? (messagesStore.messagesMap[activeConversationId.value] ?? []) : [],
  )

  const isLoadingMessages = computed<boolean>(() =>
    activeConversationId.value ? !!messagesStore.messagesLoadingMap[activeConversationId.value] : false,
  )

  const draft = computed({
    get: () => (activeConversationId.value ? (messagesStore.drafts[activeConversationId.value] ?? '') : ''),
    set: (text: string) => {
      if (activeConversationId.value) {
        messagesStore.setDraft(activeConversationId.value, text)
      }
    },
  })

  const typingUser = computed<string | null>(() =>
    activeConversationId.value ? (chatStore.typingByConversation[activeConversationId.value] ?? null) : null,
  )

  const contacts = computed<readonly Contact[]>(() =>
    chatStore.conversationStates['']?.data ?? [],
  )

  const unreadTotal = computed(() => {
    let count = 0
    for (const key of ['', 'online', 'ended', 'active'] as StateKeys[]) {
      const list = chatStore.conversationStates[key]?.data ?? []
      for (const contact of list) {
        count += contact.unreadCount ?? 0
      }
    }
    return count
  })

  const uploadProgress = computed(() => messagesStore.uploadProgress)
  const compressionProgress = computed(() => messagesStore.compressionProgress)

  const selectConversation = (id: string | null) => {
    chatStore.setSelectedChat(id)
  }

  const getContact = (id: string) => chatStore.getContactById(id)

  const addContact = (contact: Contact, filter: StateKeys = '') => {
    chatStore.addContact(contact, filter)
  }

  const updateContact = (id: string, updates: Partial<Contact>) => {
    chatStore.updateContact(id, updates as never)
  }

  const fetchConversations = (state: StateKeys = '', page = 1, search = '') => {
    return chatStore.fetchConversations(state, page, search)
  }

  const deleteConversation = (id: string) => {
    return chatStore.deleteConversation(id)
  }

  const endConversation = chatStore.endConversation
    ? (id: string) => chatStore.endConversation!(id)
    : undefined

  const setDraft = (channelId: string, text: string) => {
    messagesStore.setDraft(channelId, text)
  }

  const fetchMessages = (conversationId: string, page = 1) => {
    return messagesStore.fetchMessages(conversationId, page)
  }

  const sendMessage = async (text: string): Promise<void> => {
    const channel = activeConversationId.value
    if (!channel) {
      throw new Error('[nuxt-parley] Cannot send message: no active conversation')
    }
    const message: Message = {
      id: '',
      conversationId: channel,
      date: new Date(),
      type: 'text',
      text,
      senderId: profileStore.userId,
      isEdited: false,
      isSent: false,
      isRead: false,
    }
    await messagesStore.sendMessage([message])
  }

  const cancelSending = (messageId: string) => {
    messagesStore.cancelSending(messageId)
  }

  const retryMessage = (messageOrId: Message | string) => {
    if (typeof messageOrId === 'string') {
      const channel = activeConversationId.value
      const list = channel
        ? (messagesStore.messagesMap[channel] ?? [])
        : Object.values(messagesStore.messagesMap).flat()
      const msg = list.find((m: Message) => m.id === messageOrId)
      if (msg) {
        messagesStore.retryMessage(msg)
      }
    } else {
      messagesStore.retryMessage(messageOrId)
    }
  }

  return {
    chatStore,
    messagesStore,
    profileStore,
    activeConversationId,
    activeContact,
    activeMessages,
    isLoadingMessages,
    draft,
    typingUser,
    contacts,
    unreadTotal,
    uploadProgress,
    compressionProgress,
    selectConversation,
    getContact,
    addContact,
    updateContact,
    fetchConversations,
    deleteConversation,
    endConversation,
    setDraft,
    fetchMessages,
    sendMessage,
    cancelSending,
    retryMessage,
    reset: resetChat,
  }
}

export const useParleyChat = useParley
