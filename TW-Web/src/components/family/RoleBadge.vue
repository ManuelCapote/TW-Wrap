<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { UserRole } from '@/types'
import { ShieldCheck, UserRound } from 'lucide-vue-next'

interface Props {
  role: UserRole
  size?: 'small' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

interface BadgeConfig {
  label: string
  icon: Component
  classes: string
}

const badgeConfig: Record<UserRole, BadgeConfig> = {
  ADMIN: {
    label: 'Admin',
    icon: ShieldCheck,
    classes: 'border-primary/40 bg-primary-soft text-primary'
  },
  MEMBER: {
    label: 'Member',
    icon: UserRound,
    classes: 'border-border bg-background text-text-secondary'
  }
}

const iconSize = computed(() => (props.size === 'small' ? 12 : 14))

const sizeClasses = computed(() =>
  props.size === 'small'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-3 py-1 text-xs gap-2'
)

const badgeClasses = computed(
  () =>
    `inline-flex items-center rounded-full border font-semibold transition-colors duration-150 ease-soft-snap ${sizeClasses.value} ${badgeConfig[props.role].classes}`
)
</script>

<template>
  <span :class="badgeClasses">
    <component
      :is="badgeConfig[role].icon"
      :size="iconSize"
      :stroke-width="1.8"
      class="text-current"
    />
    <span>{{ badgeConfig[role].label }}</span>
  </span>
</template>
