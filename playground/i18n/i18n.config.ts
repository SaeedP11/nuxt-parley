// The playground's own strings. The chat's come with vue-parley and follow the same locale.
export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
  messages: {
    en: {
      signedInAs: 'Signed in as {user}',
      openAs: 'Open a tab as {user}',
      dark: 'Dark',
      light: 'Light',
    },
    fa: {
      signedInAs: 'وارد شده با {user}',
      openAs: 'باز کردن تب با {user}',
      dark: 'تیره',
      light: 'روشن',
    },
  },
}))
