<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import RoleBadge from './RoleBadge.vue'
import { Mail, Clock, Info } from 'lucide-vue-next'
import { generateAvatarDataUri } from '@/utils/avatar'

const familyStore = useFamilyStore()

const members = computed(() => familyStore.members)
const isAdmin = computed(() => familyStore.isAdmin)
const currentUserId = computed(() => familyStore.currentUserId)
const generatedAvatars = computed(() => {
  const map: Record<string, string> = {}
  members.value.forEach(member => {
    map[member.id] = generateAvatarDataUri(member.email || member.id)
  })
  return map
})

const canRemoveMember = (memberId: string, memberRole: string) => {
  if (memberId === currentUserId.value) return false
  if (memberRole === 'ADMIN') return false
  return isAdmin.value
}

const handleRemoveMember = async (userId: string, memberName: string) => {
  if (
    !confirm(
      `Remove ${memberName} from the family?\n\nThey will no longer have access to family wishlists.`
    )
  ) {
    return
  }

  try {
    await familyStore.removeMember(userId)
  } catch (error) {
    alert('Failed to remove member: ' + (error as Error).message)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  familyStore.fetchFamilyMembers()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="familyStore.isLoading" class="grid gap-4 md:grid-cols-2">
      <div
        v-for="skeleton in 2"
        :key="skeleton"
        class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20"
      >
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 animate-pulse rounded-full bg-surface-muted/70" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-32 animate-pulse rounded bg-surface-muted/70" />
            <div class="h-3 w-48 animate-pulse rounded bg-surface-muted/70" />
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <div class="h-3 w-24 animate-pulse rounded bg-surface-muted/60" />
          <div class="h-3 w-28 animate-pulse rounded bg-surface-muted/60" />
        </div>
      </div>
    </div>

    <div
      v-else-if="members.length === 0"
      class="rounded-2xl border border-dashed border-border bg-surface-muted/40 px-6 py-10 text-center text-sm text-text-secondary"
    >
      No family members found yet. Invite someone from the admin panel to get started.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <div
        v-for="member in members"
        :key="member.id"
        class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-lg hover:shadow-primary/15"
        :class="member.id === currentUserId ? 'border-primary shadow-lg shadow-primary/15' : ''"
      >
        <header class="flex items-start gap-4">
          <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-lg text-primary">
            <img
              :src="generatedAvatars[member.id]"
              :alt="`${member.name} avatar`"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-semibold text-text">{{ member.name }}</h3>
              <span
                v-if="member.id === currentUserId"
                class="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white"
              >
                You
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span class="inline-flex items-center gap-1">
                <Mail :size="12" :stroke-width="1.8" />
                {{ member.email }}
              </span>
            </div>
          </div>
        </header>

        <div class="mt-5 space-y-3 text-sm text-text-secondary">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-text-tertiary">Role</span>
            <RoleBadge :role="member.role" size="small" />
          </div>
          <div class="flex items-center gap-2 text-xs text-text-tertiary">
            <Clock :size="12" :stroke-width="1.8" />
            Joined {{ formatDate(member.createdAt) }}
          </div>
        </div>

        <div v-if="canRemoveMember(member.id, member.role)" class="mt-5 border-t border-border pt-4">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-danger bg-background px-4 py-2 text-xs font-semibold text-danger transition duration-150 ease-soft-snap hover:bg-danger-soft hover:text-danger"
            @click="handleRemoveMember(member.id, member.name)"
          >
            Remove from family
          </button>
        </div>

        <div
          v-else-if="member.role === 'ADMIN' && member.id !== currentUserId"
          class="mt-5 flex items-start gap-2 rounded-md border border-border bg-surface-muted/60 px-3 py-3 text-xs text-text-secondary"
        >
          <Info :size="14" :stroke-width="1.8" class="text-text-tertiary" />
          Admins cannot remove other admins.
        </div>
      </div>
    </div>

    <div
      v-if="members.length > 0"
      class="grid gap-4 rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20 md:grid-cols-3"
    >
      <div class="rounded-xl border border-border bg-background px-4 py-4 text-center">
        <p class="text-3xl font-semibold text-primary">{{ members.length }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">Total</p>
        <p class="mt-1 text-xs text-text-secondary">Members in this family</p>
      </div>
      <div class="rounded-xl border border-border bg-background px-4 py-4 text-center">
        <p class="text-3xl font-semibold text-primary">{{ familyStore.adminMembers.length }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">Admins</p>
        <p class="mt-1 text-xs text-text-secondary">Manage invites and settings</p>
      </div>
      <div class="rounded-xl border border-border bg-background px-4 py-4 text-center">
        <p class="text-3xl font-semibold text-primary">{{ familyStore.regularMembers.length }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">Members</p>
        <p class="mt-1 text-xs text-text-secondary">Can browse and contribute</p>
      </div>
    </div>
  </div>
</template>
