<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { Users, Settings, ShieldCheck } from 'lucide-vue-next'

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const family = computed(() => familyStore.family)
const members = computed(() => familyStore.members)
const adminMembers = computed(() => familyStore.adminMembers)
const regularMembers = computed(() => familyStore.regularMembers)
const isLoading = computed(() => familyStore.isLoading)
const hasFamily = computed(() => Boolean(family.value))
const error = computed(() => familyStore.error)

const familyName = computed(() => family.value?.name ?? 'No family yet')
const createdAt = computed(() => family.value?.createdAt)

const formatDate = (value?: Date) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(async () => {
  try {
    if (!family.value) {
      await familyStore.fetchFamily()
    }
  } catch {
    // error already captured in store
  }

  try {
    if (!members.value.length) {
      await familyStore.fetchFamilyMembers()
    }
  } catch {
    // error already captured in store
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-4xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Dashboard
        </p>
        <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
          Welcome back, {{ authStore.userName }}
        </h1>
        <p class="max-w-2xl text-base text-text-secondary md:text-lg">
          Review the live family data you manage today and jump back into the actions you use most.
        </p>
      </section>

      <section
        v-if="error"
        class="rounded-2xl border border-danger-soft bg-danger-soft/10 px-5 py-4 text-sm text-danger"
      >
        {{ error }}
      </section>

      <section class="grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Family</p>
              <h2 class="mt-3 text-2xl font-semibold tracking-tight">
                {{ familyName }}
              </h2>
              <p class="mt-2 text-sm text-text-secondary">
                {{
                  hasFamily
                    ? 'Family information reflects your backend data.'
                    : 'Create or join a family to begin.'
                }}
              </p>
            </div>
            <div class="rounded-full bg-primary-soft p-3 text-primary">
              <Users :size="20" :stroke-width="1.8" />
            </div>
          </div>

          <dl v-if="hasFamily" class="mt-6 grid gap-3 text-sm">
            <div class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt class="text-text-secondary">Members</dt>
              <dd class="font-semibold text-text">{{ members.length }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt class="text-text-secondary">Admins</dt>
              <dd class="font-semibold text-text">{{ adminMembers.length }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt class="text-text-secondary">Members (non-admin)</dt>
              <dd class="font-semibold text-text">{{ regularMembers.length }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt class="text-text-secondary">Created</dt>
              <dd class="font-semibold text-text">{{ formatDate(createdAt) }}</dd>
            </div>
          </dl>

          <p v-else class="mt-6 rounded-md border border-dashed border-border px-3 py-2 text-xs text-text-tertiary">
            Once you join a family, you’ll see its key details here.
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p class="text-sm font-semibold text-text">Quick links</p>
          <p class="mt-2 text-sm text-text-secondary">
            Shortcuts into the features that are wired up today.
          </p>

          <div class="mt-4 space-y-3">
            <RouterLink
              to="/settings"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">Manage family settings</span>
              <Settings :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>

            <RouterLink
              to="/settings"
              v-if="familyStore.isAdmin"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">Generate invite codes</span>
              <ShieldCheck :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>

            <RouterLink
              to="/family"
              v-if="members.length"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">View family wishlists</span>
              <Users :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-text">Members</p>
            <p class="mt-1 text-xs text-text-secondary">
              This mirrors the family store data used in the settings area.
            </p>
          </div>
          <RouterLink
            to="/settings"
            class="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
          >
            Manage members
          </RouterLink>
        </div>

        <div v-if="isLoading" class="mt-6 space-y-3 text-sm text-text-secondary">
          <div class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
          <div class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
          <div class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
        </div>

        <ul v-else-if="members.length" class="mt-6 space-y-3">
          <li
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-text">{{ member.name }}</p>
              <p class="text-xs text-text-secondary">{{ member.email }}</p>
            </div>
            <span class="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
              {{ member.role }}
            </span>
          </li>
        </ul>

        <p v-else class="mt-6 rounded-md border border-dashed border-border px-3 py-4 text-sm text-text-secondary">
          No members yet. Add or invite someone from the settings page.
        </p>
      </section>
    </div>
  </div>
</template>

