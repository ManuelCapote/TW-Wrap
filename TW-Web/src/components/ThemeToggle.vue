<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, toggleTheme } = useTheme()

const getThemeIcon = () => {
  switch (theme.value) {
    case 'light':
      return '☀️'
    case 'dark':
      return '🌙'
    case 'auto':
      return '🔄'
    default:
      return '🔄'
  }
}

const getThemeLabel = () => {
  switch (theme.value) {
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
    case 'auto':
      return 'Auto'
    default:
      return 'Auto'
  }
}
</script>

<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="`Current theme: ${getThemeLabel()}. Click to cycle through themes.`"
    :aria-label="`Switch theme. Current: ${getThemeLabel()}`"
  >
    <span class="theme-icon">{{ getThemeIcon() }}</span>
    <span class="theme-label">{{ getThemeLabel() }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.theme-toggle:hover {
  background: var(--color-border);
  border-color: var(--color-border-hover);
}

.theme-icon {
  font-size: 16px;
  line-height: 1;
}

.theme-label {
  font-weight: 600;
  min-width: 40px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .theme-toggle {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 13px;
  }

  .theme-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .theme-label {
    display: none;
  }
}
</style>