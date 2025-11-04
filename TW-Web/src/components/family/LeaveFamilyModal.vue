<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { useFamilyStore } from '@/stores/family'
import { useToast } from '@/composables/useToast'
import { AlertTriangle, Users } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  currentFamilyName?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const familyStore = useFamilyStore()
const { success, error: showError } = useToast()

const confirmationText = ref('')
const isLeaving = ref(false)
const error = ref<string | null>(null)

const isValidConfirmation = computed(() => {
  return confirmationText.value.trim().toUpperCase() === 'LEAVE'
})

const canSubmit = computed(() => isValidConfirmation.value && !isLeaving.value)

// Check if user is admin
const isAdmin = computed(() => familyStore.isAdmin)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  confirmationText.value = target.value
  // Clear error when user starts typing
  if (error.value) {
    error.value = null
  }
}

const handleLeave = async () => {
  if (!canSubmit.value) return

  // Admin guard
  if (isAdmin.value) {
    error.value = 'Admins must transfer ownership before leaving the family'
    return
  }

  try {
    isLeaving.value = true
    error.value = null

    await familyStore.leaveFamily()

    success('You have left the family and created your own workspace')
    emit('success')
    handleClose()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to leave family'
    error.value = errorMessage
    showError(errorMessage)
  } finally {
    isLeaving.value = false
  }
}

const handleClose = () => {
  if (isLeaving.value) return
  confirmationText.value = ''
  error.value = null
  emit('close')
}

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      confirmationText.value = ''
      error.value = null
    }
  }
)
</script>

<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog data-role="modal" data-modal-type="leave-family" as="div" class="relative z-50" @close="handleClose">
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div data-role="modal-overlay" class="fixed inset-0 bg-black/70 backdrop-blur-sm" />
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
            <DialogPanel data-role="modal-panel" class="w-full max-w-lg rounded-2xl border border-border bg-surface px-6 py-6 text-text shadow-xl shadow-black/40">
              <div data-role="modal-header" class="flex items-center justify-between">
                <DialogTitle class="text-lg font-semibold text-text">
                  Leave family
                </DialogTitle>
                <button
                  type="button"
                  data-role="button"
                  data-action="close"
                  :data-loading="isLeaving"
                  class="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isLeaving"
                  @click="handleClose"
                >
                  Close
                </button>
              </div>

              <div data-role="modal-body" class="mt-6 space-y-5">
                <div data-role="alert" data-alert-type="warning" class="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-xs text-danger">
                  <AlertTriangle :size="18" :stroke-width="1.8" class="mt-[2px] shrink-0" />
                  <div class="space-y-2">
                    <p class="font-semibold">
                      You're about to leave <strong>{{ currentFamilyName || 'your current family' }}</strong>
                    </p>
                    <ul class="list-inside list-disc space-y-1 text-[11px] font-normal">
                      <li>You'll create your own solo family workspace</li>
                      <li>Your wishlist items will stay with you</li>
                      <li>You won't have access to other members' wishlists</li>
                      <li>This action cannot be undone</li>
                    </ul>
                  </div>
                </div>

                <!-- Admin guard message -->
                <div v-if="isAdmin" data-role="alert" data-alert-type="error" class="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-xs text-danger">
                  <AlertTriangle :size="18" :stroke-width="1.8" class="mt-[2px] shrink-0" />
                  <p>
                    <strong>You cannot leave as an admin.</strong> Please transfer ownership to another member first, or remove all other members before leaving.
                  </p>
                </div>

                <!-- Confirmation input -->
                <div v-if="!isAdmin" data-role="form-container" data-form-type="leave-family" class="space-y-2 text-xs font-semibold text-text-secondary">
                  <label for="confirmationText" data-role="form-label">
                    Type <span class="font-mono text-danger">LEAVE</span> to confirm
                    <span class="text-danger">*</span>
                  </label>
                  <input
                    id="confirmationText"
                    v-model="confirmationText"
                    type="text"
                    data-role="form-input"
                    data-input-type="confirmation"
                    :data-validation-state="confirmationText && !isValidConfirmation ? 'invalid' : (isValidConfirmation ? 'valid' : 'pristine')"
                    placeholder="Type LEAVE"
                    class="w-full rounded-md border border-border bg-background px-3 py-3 font-mono text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    :class="{
                      'border-danger focus:ring-danger/30': confirmationText && !isValidConfirmation,
                      'border-success focus:ring-success/30': isValidConfirmation
                    }"
                    maxlength="10"
                    :disabled="isLeaving"
                    @input="handleInput"
                  />
                  <p class="text-[11px] font-normal text-text-tertiary">
                    This confirms you understand the consequences of leaving.
                  </p>
                </div>

                <!-- Error message -->
                <div v-if="error" data-role="alert" data-alert-type="error" class="flex items-start gap-2 rounded-md border border-danger bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
                  <AlertTriangle :size="14" :stroke-width="1.8" class="mt-[2px] shrink-0" />
                  {{ error }}
                </div>
              </div>

              <div data-role="modal-footer" class="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                <div data-role="form-actions">
                  <button
                    type="button"
                    data-role="button"
                    data-action="cancel"
                    :data-loading="isLeaving"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isLeaving"
                    @click="handleClose"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="!isAdmin"
                    type="button"
                    data-role="button"
                    data-action="submit"
                    data-action-type="destructive"
                    :data-loading="isLeaving"
                    class="inline-flex items-center gap-2 rounded-md bg-danger px-4 py-2 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-danger/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
                    :disabled="!canSubmit"
                    @click="handleLeave"
                  >
                    <Users v-if="!isLeaving" :size="14" :stroke-width="1.8" />
                    {{ isLeaving ? 'Leaving…' : 'Leave family' }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
