import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Aura with vue-parley's teal as primary; the chat takes its accent from the preset. `.dark` on
// <html> switches PrimeVue and the chat to dark together.
export default {
  preset: definePreset(Aura, {
    semantic: {
      primary: {
        50: '#d4f9f5',
        100: '#afeee7',
        200: '#7eded4',
        300: '#59c9be',
        400: '#40b8ac',
        500: '#26a99c',
        600: '#1a9d90',
        700: '#0e9688',
        800: '#047c70',
        900: '#055850',
        950: '#033b36',
      },
    },
  }),
  options: { darkModeSelector: '.dark' },
}
