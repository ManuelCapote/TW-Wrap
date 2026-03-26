import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'tw-web-theme'

export const useThemeStore = defineStore('theme', () => {
  // Initialize theme from localStorage or default to 'dark'
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  const theme = ref<Theme>(savedTheme || 'dark')

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // Watch for theme changes and persist to localStorage
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
    },
    { immediate: true }
  )

  return {
    theme,
    setTheme,
    toggleTheme
  }
})
