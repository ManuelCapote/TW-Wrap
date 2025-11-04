<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { generateAvatarDataUri } from '@/utils/avatar'
import { Toaster } from 'vue-sonner'
import {
  LayoutDashboard,
  Gift,
  Users as UsersIcon,
  Settings as SettingsIcon,
  FlaskConical
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isDev = import.meta.env.DEV

const userAvatarUri = computed(() => {
  const seed = authStore.user?.email || authStore.user?.name || 'user'
  return generateAvatarDataUri(seed)
})

const navLinks = computed(() => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-wishlist', label: 'Wishlist', icon: Gift },
    { to: '/family', label: 'Family', icon: UsersIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon }
  ]

  if (isDev) {
    links.push({ to: '/design-spike', label: 'Design', icon: FlaskConical })
  }

  return links
})

const isLinkActive = (to: string) => {
  if (to === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(to)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-text">
    <!-- Toast Notifications -->
    <Toaster
      position="top-right"
      :duration="4000"
      :toastOptions="{
        className: 'tw-toast',
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        }
      }"
      closeButton
    />

    <header
      v-if="authStore.isAuthenticated"
      class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur"
    >
      <div class="mx-auto flex h-16 w-full max-w-5xl items-center gap-6 px-4 md:px-6">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-sm font-semibold text-text transition duration-150 ease-soft-snap hover:border-primary hover:text-primary"
        >
          <span class="h-2 w-2 rounded-full bg-primary" />
          TW-Web
        </RouterLink>

        <nav class="flex flex-1 items-center justify-center">
          <div class="flex items-center gap-1 rounded-full border border-border bg-surface-muted/60 p-1 text-sm">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition duration-150 ease-soft-snap"
              :class="
                isLinkActive(link.to)
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'text-text-secondary hover:text-text'
              "
            >
              <component :is="link.icon" :size="14" :stroke-width="1.8" />
              <span class="hidden sm:inline">{{ link.label }}</span>
            </RouterLink>
          </div>
        </nav>

        <div class="flex items-center gap-3 rounded-full border border-border bg-background/70 px-2 py-1">
          <div class="h-9 w-9 overflow-hidden rounded-full border border-border/60 bg-primary-soft">
            <img :src="userAvatarUri" alt="User avatar" class="h-full w-full object-cover" />
          </div>
          <div class="hidden text-right sm:block">
            <p class="text-xs font-semibold text-text">{{ authStore.userName }}</p>
            <p class="text-[11px] text-text-tertiary">
              {{ authStore.user?.email }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-danger hover:text-danger"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
