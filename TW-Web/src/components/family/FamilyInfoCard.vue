<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { useToast } from '@/composables/useToast'
import { Users, Pencil, Check, X, Calendar, Crown } from 'lucide-vue-next'

const familyStore = useFamilyStore()
const { success, error } = useToast()

const isEditing = ref(false)
const editedName = ref('')
const isSaving = ref(false)

const family = computed(() => familyStore.family)
const memberCount = computed(() => familyStore.members.length)

const startEdit = () => {
  editedName.value = family.value?.name || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editedName.value = ''
}

const saveEdit = async () => {
  if (!editedName.value.trim()) {
    error('Family name cannot be empty')
    return
  }

  try {
    isSaving.value = true
    await familyStore.updateFamilyName(editedName.value.trim())
    isEditing.value = false
    success('Family name updated successfully')
  } catch (err) {
    error('Failed to update family name')
  } finally {
    isSaving.value = false
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  if (!family.value) {
    familyStore.fetchFamily()
  }
})
</script>

<template>
  <div data-role="card" data-card-type="family-info" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
    <div v-if="familyStore.isLoading" data-loading="true" data-role="loading-container" class="space-y-4">
      <div data-role="skeleton" data-skeleton-type="text" class="h-4 w-24 animate-pulse rounded bg-surface-muted/60" />
      <div data-role="skeleton" data-skeleton-type="text" class="h-6 w-48 animate-pulse rounded bg-surface-muted/60" />
      <div data-role="skeleton" data-skeleton-type="card" class="h-10 w-full animate-pulse rounded bg-surface-muted/60" />
    </div>

    <div
      v-else-if="!family"
      data-role="empty-state"
      data-empty-type="no-data"
      class="rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-text-secondary"
    >
      No family information available yet.
    </div>

    <div v-else class="space-y-5">
      <header data-role="card-header" class="flex flex-wrap items-start gap-4">
        <div data-role="stat-icon" class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Users :size="28" :stroke-width="1.8" />
        </div>
        <div class="flex-1 space-y-3">
          <div class="flex flex-wrap items-center gap-3">
            <template v-if="!isEditing">
              <h2 data-role="card-title" class="text-2xl font-semibold tracking-tight text-text">
                {{ family.name }}
              </h2>
              <button
                v-if="familyStore.isAdmin"
                type="button"
                data-role="button"
                data-action="edit"
                class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary"
                @click="startEdit"
              >
                <Pencil :size="14" :stroke-width="1.8" />
                Rename
              </button>
            </template>
            <div v-else class="flex flex-1 items-center gap-3">
              <input
                v-model="editedName"
                type="text"
                data-role="form-input"
                data-input-type="family-name"
                class="flex-1 rounded-md border border-primary bg-background px-3 py-2 text-sm font-semibold text-text outline-none transition focus:border-primary-hover focus:ring-2 focus:ring-primary/40"
                placeholder="Enter family name"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                autofocus
              />
              <button
                type="button"
                data-role="button"
                data-action="submit"
                :data-loading="isSaving"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success text-white transition duration-150 ease-soft-snap hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSaving"
                @click="saveEdit"
              >
                <Check v-if="!isSaving" :size="16" :stroke-width="2" />
                <span v-else class="text-xs font-semibold">...</span>
              </button>
              <button
                type="button"
                data-role="button"
                data-action="cancel"
                :data-loading="isSaving"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-text-secondary transition duration-150 ease-soft-snap hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSaving"
                @click="cancelEdit"
              >
                <X :size="16" :stroke-width="2" />
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span
              data-role="badge"
              data-badge-type="count"
              class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-semibold"
            >
              <Users :size="14" :stroke-width="1.8" class="text-text-tertiary" />
              {{ memberCount }} member{{ memberCount !== 1 ? 's' : '' }}
            </span>
            <span
              data-role="badge"
              data-badge-type="date"
              class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-semibold"
            >
              <Calendar :size="14" :stroke-width="1.8" class="text-text-tertiary" />
              Created {{ formatDate(family.createdAt) }}
            </span>
          </div>
        </div>
      </header>

      <footer
        v-if="familyStore.isAdmin"
        data-role="alert"
        data-alert-type="info"
        class="flex items-center gap-3 rounded-xl border border-primary/50 bg-primary-soft/30 px-4 py-3 text-xs font-semibold text-primary"
      >
        <Crown :size="16" :stroke-width="1.8" />
        You are an admin of this family. You can rename the family, invite members, and manage access.
      </footer>
    </div>
  </div>
</template>
