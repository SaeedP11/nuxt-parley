<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const route = useRoute()

const user = computed(() => route.query.user?.toString() ?? 'me')
const otherUser = computed(() => (user.value === 'me' ? 'other' : 'me'))
const dark = ref(false)

const dir = computed(() => locales.value.find(l => l.code === locale.value)?.dir ?? 'ltr')
useHead({
  htmlAttrs: { lang: locale, dir, class: computed(() => (dark.value ? 'dark' : '')) },
})
</script>

<template>
  <div class="playground">
    <header>
      <strong>nuxt-parley</strong>
      <span>{{ $t('signedInAs', { user }) }}</span>
      <a
        :href="`?user=${otherUser}`"
        target="_blank"
      >{{ $t('openAs', { user: otherUser }) }}</a>
      <span class="spacer" />
      <button
        v-for="l in locales"
        :key="l.code"
        :disabled="l.code === locale"
        @click="setLocale(l.code)"
      >
        {{ l.name }}
      </button>
      <button @click="dark = !dark">
        {{ dark ? $t('light') : $t('dark') }}
      </button>
    </header>
    <main>
      <ChatPage />
    </main>
  </div>
</template>

<style>
html,
body,
#__nuxt {
  height: 100%;
  margin: 0;
}

.playground {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: system-ui, sans-serif;
  color: #1f2328;
  background: #fff;
}

.dark .playground {
  color: #e6edf3;
  background: #0d1117;
}

.playground header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #d0d7de;
  font-size: 14px;
}

.dark .playground header {
  border-color: #30363d;
}

.playground header a {
  color: inherit;
}

.playground .spacer {
  flex: 1;
}

.playground main {
  flex: 1;
  min-height: 0;
}
</style>
