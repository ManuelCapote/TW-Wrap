<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/services/userApi'
import { useAuthStore } from '@/stores/auth'
import { AlertTriangle } from 'lucide-vue-next'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()
const router = useRouter()
const authStore = useAuthStore()

// Form state
const confirmationText = ref('')
const isLoading = ref(false)
const error = ref('')

const REQUIRED_TEXT = 'DELETE'

const isValid = computed(() => {
  return confirmationText.value.trim() === REQUIRED_TEXT
})

const handleDelete = async () => {
  if (!isValid.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    await userApi.deleteAccount()

    // Clear auth state
    authStore.logout()

    // Redirect to auth page
    router.push('/auth')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete account'
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
        <div class="header-content">
          <AlertTriangle :size="24" :stroke-width="2" class="warning-icon" />
          <h2>Delete Account</h2>
        </div>
        <button type="button" @click="cancel" class="close-btn" aria-label="Close">×</button>
      </div>

      <div class="modal-body">
        <div class="warning-section">
          <p class="warning-text">
            <strong>This action cannot be undone.</strong> Deleting your account will permanently
            remove:
          </p>
          <ul class="warning-list">
            <li>Your user profile and settings</li>
            <li>All your wishlist items</li>
            <li>Your purchase history</li>
            <li>Your family membership</li>
          </ul>
          <p class="warning-note">
            If you're the last member of your family, the entire family will be deleted.
          </p>
        </div>

        <form @submit.prevent="handleDelete" class="form">
          <div class="form-group">
            <label for="confirmation">
              Type <strong>{{ REQUIRED_TEXT }}</strong> to confirm deletion:
            </label>
            <input
              id="confirmation"
              v-model="confirmationText"
              type="text"
              placeholder="Type DELETE to confirm"
              class="form-input"
              :disabled="isLoading"
              autocomplete="off"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="cancel" class="btn-secondary" :disabled="isLoading">
              Cancel
            </button>
            <button type="submit" class="btn-danger" :disabled="!isValid || isLoading">
              {{ isLoading ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </form>
      </div>
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
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-error-bg);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.warning-icon {
  color: var(--color-error);
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-error);
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
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-text);
}

.modal-body {
  padding: var(--spacing-lg);
}

.warning-section {
  margin-bottom: var(--spacing-xl);
}

.warning-text {
  color: var(--color-text);
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.5;
}

.warning-list {
  margin: 0 0 var(--spacing-md) 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.warning-list li {
  margin-bottom: var(--spacing-xs);
}

.warning-note {
  margin: 0;
  padding: var(--spacing-md);
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  color: var(--color-warning);
  font-size: 14px;
  line-height: 1.5;
}

.form {
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
  font-family: monospace;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-error);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: var(--color-error-bg);
  color: var(--color-error);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn-danger,
.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-error-hover);
}

.btn-danger:disabled {
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

  .btn-danger,
  .btn-secondary {
    width: 100%;
  }
}
</style>
