import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'tw-web-theme'

const theme = ref<Theme>('auto')
const isDark = ref(false)

function setTheme(newTheme: Theme) {
  theme.value = newTheme
  localStorage.setItem(STORAGE_KEY, newTheme)
  applyTheme(newTheme)
}

function applyTheme(selectedTheme: Theme) {
  const root = document.documentElement
  
  if (selectedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark')
    isDark.value = true
  } else if (selectedTheme === 'light') {
    root.setAttribute('data-theme', 'light')
    isDark.value = false
  } else {
    // Auto mode - remove attribute to use system preference
    root.removeAttribute('data-theme')
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

function toggleTheme() {
  if (theme.value === 'light') {
    setTheme('dark')
  } else if (theme.value === 'dark') {
    setTheme('auto')
  } else {
    setTheme('light')
  }
}

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  const initialTheme = stored || 'auto'
  
  theme.value = initialTheme
  applyTheme(initialTheme)
  
  // Listen for system theme changes when in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    if (theme.value === 'auto') {
      isDark.value = mediaQuery.matches
    }
  }
  
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  handleSystemThemeChange()
}

export function useTheme() {
  onMounted(() => {
    if (typeof window !== 'undefined') {
      initTheme()
    }
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  }
}