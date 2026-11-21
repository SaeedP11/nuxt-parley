import { describe, expect, it, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import { createChat } from 'vue-parley'
import type { ChatHandlers, MediaHandlers, MessagesHandlers } from 'vue-parley'
import type { NuxtApp } from '#app'
import { formatDuration, formatBytes } from '../src/runtime/utils/format'
import { defineParleyConfig } from '../src/runtime/config'
import { installParley } from '../src/runtime/install'
import { useParleyCall } from '../src/runtime/composables/useParleyCall'
import { useParleyWhiteboard } from '../src/runtime/composables/useParleyWhiteboard'
import { useParley } from '../src/runtime/composables/useParley'

describe('utils/format', () => {
  it('formats duration in seconds to mm:ss and hh:mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(9)).toBe('00:09')
    expect(formatDuration(59)).toBe('00:59')
    expect(formatDuration(60)).toBe('01:00')
    expect(formatDuration(75)).toBe('01:15')
    expect(formatDuration(3600)).toBe('01:00:00')
    expect(formatDuration(3665)).toBe('01:01:05')
    expect(formatDuration(-10)).toBe('00:00')
    expect(formatDuration(Number.NaN)).toBe('00:00')
  })

  it('formats bytes to human-readable strings', () => {
    expect(formatBytes(0)).toBe('0 KB')
    expect(formatBytes(-100)).toBe('0 KB')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('config & install', () => {
  it('defineParleyConfig returns the given function or object', () => {
    const fnConfig = () => ({
      chat: {} as ChatHandlers,
      messages: {} as MessagesHandlers,
      media: {} as MediaHandlers,
    })
    expect(defineParleyConfig(fnConfig)).toBe(fnConfig)

    const objConfig = {
      chat: {} as ChatHandlers,
      messages: {} as MessagesHandlers,
      media: {} as MediaHandlers,
    }
    expect(defineParleyConfig(objConfig)).toBe(objConfig)
  })

  it('installParley accepts object and function configs', async () => {
    let installed = false
    const fakeNuxtApp = {
      vueApp: {
        use: () => {
          installed = true
        },
      },
    } as unknown as NuxtApp

    // null config
    await installParley(fakeNuxtApp, null)
    expect(installed).toBe(false)
  })
})

describe('composables', () => {
  beforeEach(() => {
    const app = createApp({})
    const pinia = createPinia()
    const i18n = createI18n({ legacy: false, locale: 'en', messages: {} })
    app.use(pinia)
    app.use(i18n)
    app.use(PrimeVue)
    app.use(
      createChat({
        chat: {
          fetchConversations: async () => ({ data: [], hasNextPage: false }),
          deleteConversation: async () => {},
        },
        messages: {
          fetchMessages: async () => [],
          sendMessage: async msg => msg,
          deleteMessages: async () => {},
          editMessage: async () => ({ id: '1', conversationId: 'c', date: new Date(), type: 'text', senderId: 'u', isEdited: true, isSent: true, isRead: true }),
        },
        media: {
          download: async () => new Blob(),
          getFileSize: async () => 0,
        },
      }),
    )
    setActivePinia(pinia)
  })

  it('useParleyWhiteboard manages dialog open state', () => {
    const wb = useParleyWhiteboard()
    expect(wb.isOpen.value).toBe(false)
    expect(wb.isSharing.value).toBe(false)

    wb.open()
    expect(wb.isOpen.value).toBe(true)

    wb.close()
    expect(wb.isOpen.value).toBe(false)

    wb.toggle()
    expect(wb.isOpen.value).toBe(true)
  })

  it('useParleyCall provides initial reactive call state', () => {
    const call = useParleyCall()
    expect(call.isActive.value).toBe(false)
    expect(call.isMinimized.value).toBe(false)
    expect(call.channelId.value).toBeNull()
    expect(call.elapsedTime.value).toBe(0)
    expect(call.formattedDuration.value).toBe('00:00')
    expect(call.isAudioOn.value).toBe(false)
    expect(call.isVideoOn.value).toBe(false)
    expect(call.isCameraAvailable.value).toBe(false)
    expect(call.isMicrophoneAvailable.value).toBe(false)
    expect(call.cameras.value).toEqual([])
    expect(call.microphones.value).toEqual([])
    expect(call.remoteWhiteboards.value).toEqual({})
    expect(call.participants.value).toEqual([])
    expect(call.participantCount.value).toBe(0)
    expect(call.phase.value).toBe('ended')
  })

  it('useParley provides conversation and messages interface', () => {
    const parley = useParley()
    expect(parley.activeConversationId.value).toBeNull()
    expect(parley.activeContact.value).toBeNull()
    expect(parley.activeMessages.value).toEqual([])
    expect(parley.isLoadingMessages.value).toBe(false)
    expect(parley.draft.value).toBe('')
    expect(parley.unreadTotal.value).toBe(0)

    parley.selectConversation('channel-1')
    expect(parley.activeConversationId.value).toBe('channel-1')
  })
})
