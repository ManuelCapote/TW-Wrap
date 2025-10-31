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
import { AlertTriangle, Info } from 'lucide-vue-next'

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

const inviteCode = ref('')
const isJoining = ref(false)
const error = ref<string | null>(null)

const isValidFormat = computed(() => {
  const code = inviteCode.value.trim()
  return code.length === 8 && /^[A-Z0-9]+$/.test(code)
})

const canSubmit = computed(() => isValidFormat.value && !isJoining.value)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  inviteCode.value = value
}

const handleJoin = async () => {
  if (!canSubmit.value) return

  try {
    isJoining.value = true
    error.value = null

    await familyStore.joinWithCode({
      inviteCode: inviteCode.value.trim()
    })

    emit('success')
    handleClose()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to join family'
  } finally {
    isJoining.value = false
  }
}

const handleClose = () => {
  if (isJoining.value) return
  inviteCode.value = ''
  error.value = null
  emit('close')
}

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      inviteCode.value = ''
      error.value = null
    }
  }
)
</script>

<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog data-role="modal" data-modal-type="join-family" as="div" class="relative z-50" @close="handleClose">
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
                  Join another family
                </DialogTitle>
                <button
                  type="button"
                  data-role="button"
                  data-action="close"
                  :data-loading="isJoining"
                  class="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isJoining"
                  @click="handleClose"
                >
                  Close
                </button>
              </div>

              <div data-role="modal-body" class="mt-6 space-y-5">
                <div data-role="alert" data-alert-type="warning" class="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
                  <AlertTriangle :size="18" :stroke-width="1.8" class="mt-[2px]" />
                  <p>
                    You will leave
                    <strong>{{ currentFamilyName || 'your current family' }}</strong>
                    and join a new one. Your wishlist items stay with you, but shared access will change.
                  </p>
                </div>

                <div data-role="form-container" data-form-type="join-family" class="space-y-2 text-xs font-semibold text-text-secondary">
                  <label for="inviteCode" data-role="form-label">
                    Invite code
                    <span class="text-danger">*</span>
                  </label>
                  <input
                    id="inviteCode"
                    :value="inviteCode"
                    type="text"
                    data-role="form-input"
                    data-input-type="invite-code"
                    :data-validation-state="inviteCode && !isValidFormat ? 'invalid' : (isValidFormat ? 'valid' : 'pristine')"
                    placeholder="8-character code"
                    class="w-full rounded-md border border-border bg-background px-3 py-3 font-mono text-base tracking-[0.4em] text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    :class="{
                      'border-danger focus:ring-danger/30': inviteCode && !isValidFormat,
                      'border-success focus:ring-success/30': isValidFormat
                    }"
                    maxlength="8"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    @input="handleInput"
                  />
                  <p class="text-[11px] font-normal text-text-tertiary">
                    Codes are 8 characters long. Only accept invites from people you trust.
                  </p>
                </div>

                <div v-if="error" data-role="alert" data-alert-type="error" class="flex items-start gap-2 rounded-md border border-danger bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
                  <AlertTriangle :size="14" :stroke-width="1.8" class="mt-[2px]" />
                  {{ error }}
                </div>
                <div
                  v-else-if="inviteCode && !isValidFormat"
                  data-role="alert"
                  data-alert-type="info"
                  class="flex items-start gap-2 rounded-md border border-primary bg-primary-soft/40 px-3 py-2 text-xs font-semibold text-primary"
                >
                  <Info :size="14" :stroke-width="1.8" class="mt-[2px]" />
                  Codes should contain only letters A–Z and numbers, no spaces.
                </div>
              </div>

              <div data-role="modal-footer" class="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                <div data-role="form-actions">
                  <button
                    type="button"
                    data-role="button"
                    data-action="cancel"
                    :data-loading="isJoining"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="isJoining"
                    @click="handleClose"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-role="button"
                    data-action="submit"
                    :data-loading="isJoining"
                    class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
                    :disabled="!canSubmit"
                    @click="handleJoin"
                  >
                    {{ isJoining ? 'Joining…' : 'Join with code' }}
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
