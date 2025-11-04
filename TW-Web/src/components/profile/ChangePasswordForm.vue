<script setup lang="ts">
import { ref, computed } from 'vue'
import { userApi } from '@/services/userApi'
import { useToast } from '@/composables/useToast'

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()
const { success, error: showError } = useToast()

// Form state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Field errors
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

const isValid = computed(() => {
  return (
    currentPassword.value.trim() &&
    newPassword.value.trim() &&
    confirmPassword.value.trim() &&
    !currentPasswordError.value &&
    !newPasswordError.value &&
    !confirmPasswordError.value
  )
})

const validateCurrentPassword = () => {
  currentPasswordError.value = ''
  if (!currentPassword.value.trim()) {
    currentPasswordError.value = 'Current password is required'
  }
}

const validateNewPassword = () => {
  newPasswordError.value = ''

  if (!newPassword.value.trim()) {
    newPasswordError.value = 'New password is required'
    return
  }

  if (newPassword.value.length < 6) {
    newPasswordError.value = 'Password must be at least 6 characters'
    return
  }

  if (newPassword.value === currentPassword.value) {
    newPasswordError.value = 'New password must be different from current password'
  }
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = ''

  if (!confirmPassword.value.trim()) {
    confirmPasswordError.value = 'Please confirm your new password'
    return
  }

  if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  }
}

const handleSubmit = async () => {
  // Validate all fields
  validateCurrentPassword()
  validateNewPassword()
  validateConfirmPassword()

  if (!isValid.value || isLoading.value) return

  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    await userApi.changePassword(currentPassword.value, newPassword.value)

    successMessage.value = 'Password changed successfully!'
    success('Password changed successfully!')

    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // Close modal after short delay
    setTimeout(() => {
      emit('success')
      emit('close')
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to change password'
    showError('Failed to change password')
  } finally {
    isLoading.value = false
  }
}

const cancel = () => {
  emit('close')
}
</script>

<template>
  <div data-role="modal-overlay" class="modal-overlay" @click.self="cancel">
    <div data-role="modal-content" class="modal-content">
      <div class="modal-header">
        <h2>Change Password</h2>
        <button type="button" @click="cancel" class="close-btn" aria-label="Close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="current-password">Current Password</label>
          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            placeholder="Enter current password"
            class="form-input"
            :class="{ error: currentPasswordError }"
            autocomplete="current-password"
            :disabled="isLoading"
            @blur="validateCurrentPassword"
          />
          <span v-if="currentPasswordError" class="field-error">{{ currentPasswordError }}</span>
        </div>

        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            class="form-input"
            :class="{ error: newPasswordError }"
            autocomplete="new-password"
            :disabled="isLoading"
            @blur="validateNewPassword"
          />
          <span v-if="newPasswordError" class="field-error">{{ newPasswordError }}</span>
          <span v-else class="help-text">Must be at least 6 characters</span>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            class="form-input"
            :class="{ error: confirmPasswordError }"
            autocomplete="new-password"
            :disabled="isLoading"
            @blur="validateConfirmPassword"
          />
          <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div class="modal-actions">
          <button type="button" @click="cancel" class="btn-secondary" :disabled="isLoading">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="!isValid || isLoading">
            {{ isLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.form {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.error {
  border-color: var(--color-error);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  color: var(--color-error);
  font-size: 13px;
}

.help-text {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.error-message {
  background: var(--color-error-bg);
  color: var(--color-error);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.success-message {
  background: var(--color-success-bg);
  color: var(--color-success);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
