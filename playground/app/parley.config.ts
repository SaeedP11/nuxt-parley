import { createBroadcastCallHandlers, createFakeBackend, demoData } from 'vue-parley/fakes'

// An in-memory backend, so the playground needs no server. `?user=` picks who you are: open two
// tabs with different users, open the same conversation in both and start a call. They signal
// over a BroadcastChannel and connect directly.
export default defineParleyConfig(() => {
  const userId = new URLSearchParams(location.search).get('user') ?? 'me'
  const backend = createFakeBackend(demoData(userId), { latency: 300 })

  return {
    chat: backend.chat,
    messages: backend.messages,
    media: backend.media,
    profile: backend.profile,
    call: createBroadcastCallHandlers(),
    user: { id: userId, name: userId },
  }
})
