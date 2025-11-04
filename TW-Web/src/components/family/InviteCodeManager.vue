<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { useFamilyStore } from '@/stores/family'
import { useToast } from '@/composables/useToast'
import { Check, Clipboard, Sparkles } from 'lucide-vue-next'

const familyStore = useFamilyStore()
const { success, error, confirm } = useToast()

const expiresInDays = ref(7)
const maxUses = ref(10)
const isCreating = ref(false)

const showNewCodeModal = ref(false)
const newlyCreatedCode = ref('')
const copiedCode = ref('')

const activeInvites = computed(() => familyStore.invites)
const hasInvites = computed(() => activeInvites.value.length > 0)

const handleCreateInvite = async () => {
  try {
    isCreating.value = true
    const invite = await familyStore.createInviteCode({
      expiresInDays: expiresInDays.value,
      maxUses: maxUses.value
    })
    newlyCreatedCode.value = invite.code
    showNewCodeModal.value = true
    success('Invite code created successfully!')
  } catch (err) {
    error('Failed to create invite code')
  } finally {
    isCreating.value = false
  }
}

const handleRevokeInvite = async (code: string) => {
  confirm(`Are you sure you want to revoke invite code ${code}?`, async () => {
    try {
      await familyStore.revokeInvite(code)
      success('Invite code revoked')
    } catch (err) {
      error('Failed to revoke invite')
    }
  })
}

const copyToClipboard = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = code
    success('Code copied to clipboard!')
    setTimeout(() => {
      copiedCode.value = ''
    }, 2000)
  } catch (err) {
    error('Failed to copy code')
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isExpired = (date: Date) => new Date(date) < new Date()

const usageStatusClass = (currentUses: number, maxUses: number) => {
  const percentage = (currentUses / maxUses) * 100
  if (percentage >= 100) return 'text-danger'
  if (percentage >= 75) return 'text-warning'
  if (percentage >= 50) return 'text-primary'
  return 'text-text-secondary'
}

const closeModal = () => {
  showNewCodeModal.value = false
  newlyCreatedCode.value = ''
}

onMounted(() => {
  familyStore.loadInvites()
})
</script>

<template>
  <div class="space-y-6">
    <section data-role="section" data-section-type="form" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-text">Generate invite code</p>
          <p class="text-xs text-text-secondary">
            Configure how long the invite lasts and how many times it can be used.
          </p>
        </div>
        <Sparkles :size="24" :stroke-width="1.8" class="text-primary" />
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label data-role="form-group" class="space-y-2 text-xs font-semibold text-text-secondary">
          Expires in (days)
          <input
            id="expires"
            v-model.number="expiresInDays"
            type="number"
            data-role="form-input"
            data-input-type="expires-days"
            min="1"
            max="30"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label data-role="form-group" class="space-y-2 text-xs font-semibold text-text-secondary">
          Max uses
          <input
            id="maxUses"
            v-model.number="maxUses"
            type="number"
            data-role="form-input"
            data-input-type="max-uses"
            min="1"
            max="100"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <button
        type="button"
        data-role="button"
        data-action="submit"
        :data-loading="isCreating"
        class="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
        :disabled="isCreating || familyStore.isLoading"
        @click="handleCreateInvite"
      >
        {{ isCreating ? 'Creating…' : 'Generate invite code' }}
      </button>
    </section>

    <section data-role="section" data-section-type="list" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-text">Active invite codes</p>
          <p class="mt-1 text-xs text-text-secondary">
            Share these with trusted family members to let them join.
          </p>
        </div>
      </div>

      <div v-if="familyStore.isLoading" data-loading="true" data-role="loading-container" class="mt-6 space-y-4">
        <div v-for="skeleton in 2" :key="skeleton" data-role="skeleton" data-skeleton-type="card" class="rounded-xl border border-border bg-background px-4 py-4">
          <div class="h-4 w-32 animate-pulse rounded bg-surface-muted/70" />
          <div class="mt-3 grid gap-2 md:grid-cols-2">
            <div class="h-3 w-full animate-pulse rounded bg-surface-muted/60" />
            <div class="h-3 w-full animate-pulse rounded bg-surface-muted/60" />
          </div>
        </div>
      </div>

      <div
        v-else-if="!hasInvites"
        data-role="empty-state"
        data-empty-type="no-invites"
        class="mt-6 rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-10 text-center text-sm text-text-secondary"
      >
        No active invite codes. Generate one above when you're ready to add someone new.
      </div>

      <div v-else data-role="list" data-list-type="invites" class="mt-6 space-y-4">
        <div
          v-for="invite in activeInvites"
          :key="invite.id"
          data-role="invite-card"
          :data-invite-id="invite.id"
          :data-invite-code="invite.code"
          :data-expired="isExpired(invite.expiresAt)"
          class="grid gap-4 rounded-xl border border-border bg-background px-4 py-4 shadow-sm shadow-black/10 md:grid-cols-[1fr_auto]"
        >
          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span data-role="badge" data-badge-type="code" class="rounded-md bg-primary-soft px-3 py-1 font-mono text-sm font-semibold text-primary">
                {{ invite.code }}
              </span>
              <button
                type="button"
                data-role="button"
                data-action="copy"
                class="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary"
                @click="copyToClipboard(invite.code)"
              >
                <component
                  :is="copiedCode === invite.code ? Check : Clipboard"
                  :size="14"
                  :stroke-width="1.8"
                  :class="copiedCode === invite.code ? 'text-success' : ''"
                />
                {{ copiedCode === invite.code ? 'Copied!' : 'Copy' }}
              </button>
            </div>

            <div data-role="invite-metadata" class="grid gap-2 text-xs text-text-secondary md:grid-cols-2">
              <p class="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2">
                <span class="font-semibold text-text-tertiary">Created</span>
                <span>{{ formatDate(invite.createdAt) }}</span>
              </p>
              <p
                class="flex items-center justify-between rounded-md border border-border bg-surface-muted/40 px-3 py-2"
              >
                <span class="font-semibold text-text-tertiary">Expires</span>
                <span :class="isExpired(invite.expiresAt) ? 'text-danger font-semibold' : ''">
                  {{ formatDate(invite.expiresAt) }}
                </span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <span data-role="usage-indicator" class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 font-semibold">
                Usage
                <span :class="['font-mono', usageStatusClass(invite.currentUses, invite.maxUses)]">
                  {{ invite.currentUses }} / {{ invite.maxUses }}
                </span>
              </span>
              <span
                v-if="isExpired(invite.expiresAt)"
                data-role="badge"
                data-badge-type="status"
                data-status-type="expired"
                class="inline-flex items-center gap-2 rounded-full border border-danger bg-danger-soft px-3 py-1 font-semibold text-danger"
              >
                Expired
              </span>
            </div>
          </div>

          <div class="flex items-start justify-end">
            <button
              type="button"
              data-role="button"
              data-action="delete"
              class="inline-flex items-center gap-2 rounded-md border border-danger bg-background px-3 py-2 text-xs font-semibold text-danger transition duration-150 ease-soft-snap hover:bg-danger-soft hover:text-danger"
              @click="handleRevokeInvite(invite.code)"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </section>

    <TransitionRoot :show="showNewCodeModal" as="template">
      <Dialog data-role="modal" data-modal-type="invite-code" as="div" class="relative z-50" @close="closeModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div data-role="modal-overlay" class="fixed inset-0 bg-black/70 backdrop-blur" />
        </TransitionChild>

        <div class="fixed inset-0 z-50 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-200"
              enter-from="opacity-0 translate-y-2 scale-95"
              enter-to="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leave-from="opacity-100 translate-y-0 scale-100"
              leave-to="opacity-0 translate-y-2 scale-95"
            >
              <DialogPanel data-role="modal-panel" class="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-6 text-text shadow-xl shadow-black/40">
                <div data-role="modal-header" class="flex items-center justify-between gap-4">
                  <DialogTitle class="text-lg font-semibold text-text">
                    Invite code created
                  </DialogTitle>
                  <button
                    type="button"
                    data-role="button"
                    data-action="close"
                    class="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary"
                    @click="closeModal"
                  >
                    Close
                  </button>
                </div>

                <div data-role="modal-body" class="mt-5 space-y-4">
                  <div class="rounded-xl border border-primary/40 bg-primary-soft/30 px-4 py-6 text-center">
                    <p data-role="badge" data-badge-type="code" class="font-mono text-3xl font-semibold tracking-[0.4em] text-primary">
                      {{ newlyCreatedCode }}
                    </p>
                    <p class="mt-3 text-xs text-primary">
                      Share this code privately with the person you want to invite.
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
                    <p>Expires in {{ expiresInDays }} day{{ expiresInDays === 1 ? '' : 's' }}</p>
                    <p>Max {{ maxUses }} use{{ maxUses === 1 ? '' : 's' }}</p>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
