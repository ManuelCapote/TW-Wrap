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
  <div data-role="page-container" class="min-h-screen bg-background text-text">
    <div data-role="content-wrapper" class="mx-auto max-w-4xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section data-role="section" data-section-type="hero" class="space-y-4">
        <p data-role="eyebrow-label" class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Dashboard
        </p>
        <h1 data-role="page-title" class="text-4xl font-semibold tracking-tight md:text-5xl">
          Welcome back, {{ authStore.userName }}
        </h1>
        <p data-role="page-description" class="max-w-2xl text-base text-text-secondary md:text-lg">
          Review the live family data you manage today and jump back into the actions you use most.
        </p>
      </section>

      <section
        v-if="error"
        data-role="alert"
        data-alert-type="error"
        class="rounded-2xl border border-danger-soft bg-danger-soft/10 px-5 py-4 text-sm text-danger"
      >
        {{ error }}
      </section>

      <section data-role="grid" data-grid-type="stats" class="grid gap-6 md:grid-cols-2">
        <div data-role="card" data-card-type="family-info" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div data-role="card-header" class="flex items-start justify-between gap-4">
            <div data-role="card-content">
              <p data-role="card-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Family</p>
              <h2 data-role="card-title" class="mt-3 text-2xl font-semibold tracking-tight">
                {{ familyName }}
              </h2>
              <p data-role="card-description" class="mt-2 text-sm text-text-secondary">
                {{
                  hasFamily
                    ? 'Family information reflects your backend data.'
                    : 'Create or join a family to begin.'
                }}
              </p>
            </div>
            <div data-role="icon-container" class="rounded-full bg-primary-soft p-3 text-primary">
              <Users :size="20" :stroke-width="1.8" />
            </div>
          </div>

          <dl v-if="hasFamily" data-role="stats-list" class="mt-6 grid gap-3 text-sm">
            <div data-role="stat-row" data-stat-type="members" class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt data-role="stat-label" class="text-text-secondary">Members</dt>
              <dd data-role="stat-value" class="font-semibold text-text">{{ members.length }}</dd>
            </div>
            <div data-role="stat-row" data-stat-type="admins" class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt data-role="stat-label" class="text-text-secondary">Admins</dt>
              <dd data-role="stat-value" class="font-semibold text-text">{{ adminMembers.length }}</dd>
            </div>
            <div data-role="stat-row" data-stat-type="regular-members" class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt data-role="stat-label" class="text-text-secondary">Members (non-admin)</dt>
              <dd data-role="stat-value" class="font-semibold text-text">{{ regularMembers.length }}</dd>
            </div>
            <div data-role="stat-row" data-stat-type="created-date" class="flex items-center justify-between rounded-md bg-surface-muted/40 px-3 py-2">
              <dt data-role="stat-label" class="text-text-secondary">Created</dt>
              <dd data-role="stat-value" class="font-semibold text-text">{{ formatDate(createdAt) }}</dd>
            </div>
          </dl>

          <p v-else data-role="empty-state" class="mt-6 rounded-md border border-dashed border-border px-3 py-2 text-xs text-text-tertiary">
            Once you join a family, you'll see its key details here.
          </p>
        </div>

        <div data-role="card" data-card-type="quick-links" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p data-role="card-title" class="text-sm font-semibold text-text">Quick links</p>
          <p data-role="card-description" class="mt-2 text-sm text-text-secondary">
            Shortcuts into the features that are wired up today.
          </p>

          <div data-role="quick-links-list" class="mt-4 space-y-3">
            <RouterLink
              to="/settings"
              data-role="quick-link"
              data-link-type="settings"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">Manage family settings</span>
              <Settings :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>

            <RouterLink
              to="/settings"
              v-if="familyStore.isAdmin"
              data-role="quick-link"
              data-link-type="invite-codes"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">Generate invite codes</span>
              <ShieldCheck :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>

            <RouterLink
              to="/family"
              v-if="members.length"
              data-role="quick-link"
              data-link-type="wishlists"
              class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-text transition duration-150 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <span class="font-semibold">View family wishlists</span>
              <Users :size="18" :stroke-width="1.8" class="text-text-secondary" />
            </RouterLink>
          </div>
        </div>
      </section>

      <section data-role="section" data-section-type="members-list" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div data-role="section-header" class="flex items-center justify-between gap-4">
          <div data-role="header-content">
            <p data-role="section-title" class="text-sm font-semibold text-text">Members</p>
            <p data-role="section-description" class="mt-1 text-xs text-text-secondary">
              This mirrors the family store data used in the settings area.
            </p>
          </div>
          <RouterLink
            to="/settings"
            data-role="button"
            data-action="manage-members"
            class="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
          >
            Manage members
          </RouterLink>
        </div>

        <div v-if="isLoading" data-loading="true" data-role="loading-container" class="mt-6 space-y-3 text-sm text-text-secondary">
          <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
          <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
          <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
        </div>

        <ul v-else-if="members.length" data-role="list" data-list-type="members" class="mt-6 space-y-3">
          <li
            v-for="member in members"
            :key="member.id"
            data-role="list-item"
            data-item-type="member"
            :data-member-id="member.id"
            class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/40 px-4 py-3"
          >
            <div data-role="member-info">
              <p data-role="member-name" class="text-sm font-semibold text-text">{{ member.name }}</p>
              <p data-role="member-email" class="text-xs text-text-secondary">{{ member.email }}</p>
            </div>
            <span data-role="badge" data-badge-type="role" class="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
              {{ member.role }}
            </span>
          </li>
        </ul>

        <p v-else data-role="empty-state" data-empty-type="no-members" class="mt-6 rounded-md border border-dashed border-border px-3 py-4 text-sm text-text-secondary">
          No members yet. Add or invite someone from the settings page.
        </p>
      </section>
    </div>
  </div>
</template>

