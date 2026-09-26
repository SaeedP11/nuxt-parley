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
  <div class="flex h-dvh flex-col bg-(--p-content-background) text-(--p-text-color)">
    <Toolbar class="shrink-0 rounded-none! border-x-0! border-t-0! px-4! py-2!">
      <template #start>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <strong>nuxt-parley</strong>
          <span class="text-(--p-text-muted-color)">{{ $t('signedInAs', { user }) }}</span>
          <Button
            as="a"
            :href="`?user=${otherUser}`"
            target="_blank"
            variant="link"
            size="small"
            :label="$t('openAs', { user: otherUser })"
          />
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-x-2">
          <SelectButton
            :model-value="locale"
            :options="locales"
            option-label="name"
            option-value="code"
            :allow-empty="false"
            size="small"
            @update:model-value="setLocale"
          />
          <ToggleButton
            v-model="dark"
            :on-label="$t('dark')"
            :off-label="$t('light')"
            size="small"
          />
        </div>
      </template>
    </Toolbar>
    <main class="min-h-0 flex-1">
      <ChatPage />
    </main>
  </div>
</template>
