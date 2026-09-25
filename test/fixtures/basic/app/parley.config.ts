import { createFakeBackend, e2eData } from 'vue-parley/fakes'

export default defineParleyConfig(() => {
  const backend = createFakeBackend(e2eData('me'), { latency: 0 })
  return {
    chat: backend.chat,
    messages: backend.messages,
    media: backend.media,
    user: { id: 'me', name: 'me' },
  }
})
