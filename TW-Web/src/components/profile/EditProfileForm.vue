<script setup lang="ts">
import { ref, computed } from 'vue'
import { userApi } from '@/services/userApi'
import { useAuthStore } from '@/stores/auth'
import { generateAvatarDataUri } from '@/utils/avatar'

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()
const authStore = useAuthStore()

// Form state
const name = ref(authStore.user?.name || '')
const avatar = ref(authStore.user?.avatar || authStore.user?.email || 'default')
const isLoading = ref(false)
const error = ref('')

// Avatar seed options - different seeds generate different DiceBear avatars
const avatarSeeds = [
  { seed: authStore.user?.email || 'user', label: 'Your Default' },
  { seed: 'happy', label: 'Happy' },
  { seed: 'cool', label: 'Cool' },
  { seed: 'friendly', label: 'Friendly' },
  { seed: 'cheerful', label: 'Cheerful' },
  { seed: 'bright', label: 'Bright' },
  { seed: 'sunny', label: 'Sunny' },
  { seed: 'smile', label: 'Smile' },
  { seed: 'peace', label: 'Peace' },
  { seed: 'joy', label: 'Joy' },
  { seed: 'star', label: 'Star' },
  { seed: 'heart', label: 'Heart' },
  { seed: 'wave', label: 'Wave' },
  { seed: 'thumbs', label: 'Thumbs' },
  { seed: 'victory', label: 'Victory' },
  { seed: 'sparkle', label: 'Sparkle' }
]

const isValid = computed(() => {
  return name.value.trim().length > 0
})

const getAvatarUrl = (seed: string) => {
  return generateAvatarDataUri(seed)
}

const handleSubmit = async () => {
  if (!isValid.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const updatedUser = await userApi.updateProfile({
      name: name.value.trim(),
      avatar: avatar.value
    })

    // Update auth store with new user data
    if (authStore.user) {
      authStore.user.name = updatedUser.name
      authStore.user.avatar = updatedUser.avatar
    }

    emit('success')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
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
        <h2>Edit Profile</h2>
        <button type="button" @click="cancel" class="close-btn" aria-label="Close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Your name"
            class="form-input"
            :disabled="isLoading"
            maxlength="100"
            required
          />
        </div>

        <div class="form-group">
          <label>Avatar Style</label>
          <p class="help-text">Choose a style for your DiceBear avatar</p>
          <div class="avatar-picker">
            <button
              v-for="option in avatarSeeds"
              :key="option.seed"
              type="button"
              @click="avatar = option.seed"
              class="avatar-option"
              :class="{ selected: avatar === option.seed }"
              :disabled="isLoading"
              :title="option.label"
            >
              <img
                :src="getAvatarUrl(option.seed)"
                :alt="option.label"
                class="avatar-image"
              />
            </button>
          </div>
        </div>

        <div class="preview">
          <label>Preview</label>
          <div class="preview-card">
            <img
              :src="getAvatarUrl(avatar)"
              alt="Avatar preview"
              class="preview-avatar-img"
            />
            <span class="preview-name">{{ name || 'Your Name' }}</span>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="modal-actions">
          <button type="button" @click="cancel" class="btn-secondary" :disabled="isLoading">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="!isValid || isLoading">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
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

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--spacing-sm);
}

.avatar-option {
  aspect-ratio: 1;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-xs);
}

.avatar-option:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-surface);
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  border-width: 3px;
}

.avatar-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.preview label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.preview-avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.preview-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
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
@media (max-width: 768px) {
  .avatar-picker {
    grid-template-columns: repeat(6, 1fr);
  }
}

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

  .avatar-picker {
    grid-template-columns: repeat(4, 1fr);
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
