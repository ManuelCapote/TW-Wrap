<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { computed } from 'vue'

const { theme, isDark, toggleTheme } = useTheme()

const getThemeIcon = computed(() => {
  switch (theme.value) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'auto':
      return Monitor
    default:
      return Monitor
  }
})

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
    <component :is="getThemeIcon" :size="18" :stroke-width="2" class="theme-icon" />
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
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
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
}

@media (max-width: 480px) {
  .theme-label {
    display: none;
  }
}
</style>