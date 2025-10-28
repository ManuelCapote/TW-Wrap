<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFamilyStore } from '@/stores/family'

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

// Form state
const inviteCode = ref('')
const isJoining = ref(false)
const error = ref<string | null>(null)

// Validation
const isValidFormat = computed(() => {
  const code = inviteCode.value.trim()
  return code.length === 8 && /^[A-Z0-9]+$/.test(code)
})

const canSubmit = computed(() => {
  return isValidFormat.value && !isJoining.value
})

// Auto-uppercase and limit to 8 characters
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

    // Success!
    emit('success')
    handleClose()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to join family'
  } finally {
    isJoining.value = false
  }
}

const handleClose = () => {
  if (!isJoining.value) {
    inviteCode.value = ''
    error.value = null
    emit('close')
  }
}

const handleOverlayClick = () => {
  handleClose()
}

// Reset state when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    inviteCode.value = ''
    error.value = null
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Join Another Family</h3>
            <button
              @click="handleClose"
              :disabled="isJoining"
              class="modal-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <!-- Warning Section -->
            <div class="warning-box">
              <div class="warning-icon">⚠️</div>
              <div class="warning-content">
                <p class="warning-title">Important</p>
                <p class="warning-text">
                  You will leave
                  <strong>{{ currentFamilyName || 'your current family' }}</strong>
                  and join a new family. Your wishlist items will remain with you.
                </p>
              </div>
            </div>

            <!-- Invite Code Input -->
            <div class="form-group">
              <label for="inviteCode" class="form-label">
                Invite Code
                <span class="required">*</span>
              </label>
              <input
                id="inviteCode"
                :value="inviteCode"
                @input="handleInput"
                type="text"
                maxlength="8"
                placeholder="ABCD1234"
                class="form-input code-input"
                :class="{
                  'input-error': error,
                  'input-success': isValidFormat && inviteCode.length === 8
                }"
                :disabled="isJoining"
                autofocus
              />
              <p class="help-text">
                Enter the 8-character code shared by a family admin
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="error-message">
              <span class="error-icon">⚠️</span>
              <span class="error-text">{{ error }}</span>
            </div>

            <!-- Validation Feedback -->
            <div v-if="inviteCode && !isValidFormat" class="validation-message">
              <span class="validation-icon">ℹ️</span>
              <span class="validation-text">
                Code must be exactly 8 characters (letters and numbers only)
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button
              @click="handleClose"
              :disabled="isJoining"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="handleJoin"
              :disabled="!canSubmit"
              class="btn btn-primary"
            >
              {{ isJoining ? 'Joining...' : 'Join Family' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover:not(:disabled) {
  background: var(--color-surface-variant);
  color: var(--color-text);
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Warning Box */
.warning-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.warning-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.warning-text strong {
  color: var(--color-text);
  font-weight: 600;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.required {
  color: var(--color-danger);
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.2s;
}

.code-input {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-align: center;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-danger);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-success {
  border-color: #10b981;
}

.input-success:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.help-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  color: var(--color-danger);
}

.error-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.error-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Validation Message */
.validation-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  color: var(--color-primary);
}

.validation-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.validation-text {
  font-size: 0.875rem;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
}

/* Responsive */
@media (max-width: 640px) {
  .modal {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
