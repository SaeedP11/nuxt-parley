import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { pageCss } from './helpers'

describe('with @nuxtjs/i18n', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/i18n', import.meta.url)),
  })

  it('renders the host page and leaves the chat to the browser', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('host page')
    // Client-only: the chat's root is not rendered on the server.
    expect(html).not.toContain('class="vue-chat')
  })

  it('ships the scoped stylesheet', async () => {
    const css = await pageCss(await $fetch<string>('/'))
    expect(css).toContain('.vue-chat')
  })
})
