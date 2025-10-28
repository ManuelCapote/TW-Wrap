<script setup lang="ts">
import type { UserRole } from '@/types'
import { Crown, User } from 'lucide-vue-next'
import type { Component } from 'vue'

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
  class: string
}

const badgeConfig: Record<UserRole, BadgeConfig> = {
  ADMIN: {
    label: 'Admin',
    icon: Crown,
    class: 'badge-admin'
  },
  MEMBER: {
    label: 'Member',
    icon: User,
    class: 'badge-member'
  }
}

const config = badgeConfig[props.role]
const iconSize = props.size === 'small' ? 12 : 14
</script>

<template>
  <span :class="['role-badge', config.class, `badge-${size}`]">
    <component :is="config.icon" :size="iconSize" :stroke-width="2" class="badge-icon" />
    <span class="badge-label">{{ config.label }}</span>
  </span>
</template>

<style scoped>
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1;
  white-space: nowrap;
}

.badge-small {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  gap: 0.125rem;
}

.badge-admin {
  background: var(--color-warning);
  color: #78350f;
}

.badge-member {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.badge-icon {
  display: flex;
  align-items: center;
}

.badge-label {
  font-size: inherit;
}
</style>
