<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import type { RegisterCredentials } from '@/types'

interface Emits {
  (e: 'switch-to-login'): void
  (e: 'register-success'): void
}

const emit = defineEmits<Emits>()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const formData = ref<RegisterCredentials>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Invite code state
const hasInviteCode = ref(false)
const inviteCode = ref('')
const inviteCodeError = ref<string | null>(null)

const formErrors = ref<Partial<RegisterCredentials>>({})

const isValid = computed(() => {
  return formData.value.name.trim() &&
         formData.value.email.trim() &&
         formData.value.password.trim() &&
         formData.value.confirmPassword.trim() &&
         Object.keys(formErrors.value).length === 0
})

const validateForm = () => {
  formErrors.value = {}
  inviteCodeError.value = null

  if (!formData.value.name.trim()) {
    formErrors.value.name = 'Name is required'
  } else if (formData.value.name.trim().length < 2) {
    formErrors.value.name = 'Name must be at least 2 characters'
  }

  if (!formData.value.email.trim()) {
    formErrors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = 'Please enter a valid email'
  }

  if (!formData.value.password.trim()) {
    formErrors.value.password = 'Password is required'
  } else if (formData.value.password.length < 6) {
    formErrors.value.password = 'Password must be at least 6 characters'
  }

  if (!formData.value.confirmPassword.trim()) {
    formErrors.value.confirmPassword = 'Please confirm your password'
  } else if (formData.value.password !== formData.value.confirmPassword) {
    formErrors.value.confirmPassword = 'Passwords do not match'
  }

  // Validate invite code if provided
  if (hasInviteCode.value && inviteCode.value.trim()) {
    const code = inviteCode.value.trim()
    if (code.length !== 8) {
      inviteCodeError.value = 'Invite code must be 8 characters'
      return false
    }
    if (!/^[A-Z0-9]+$/.test(code)) {
      inviteCodeError.value = 'Invalid format - use letters and numbers only'
      return false
    }
  }

  return Object.keys(formErrors.value).length === 0
}

const handleInviteCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  inviteCode.value = value
  inviteCodeError.value = null
}

const handleSubmit = async () => {
  if (!validateForm() || authStore.isLoading) return

  try {
    authStore.clearError()
    await authStore.register(formData.value)

    // If invite code provided, join family
    if (hasInviteCode.value && inviteCode.value.trim()) {
      try {
        await familyStore.joinWithCode({
          inviteCode: inviteCode.value.trim()
        })
      } catch (error) {
        console.error('Failed to join family with invite code:', error)
        // Don't block registration success - user is still registered
        // They can join manually later via settings
      }
    }

    emit('register-success')
  } catch (error) {
    // Error is handled by the store
  }
}

const switchToLogin = () => {
  emit('switch-to-login')
}
</script>

<template>
  <div class="register-form">
    <h2>Join Your Family</h2>
    <p class="subtitle">Create an account to start sharing wishlists</p>
    
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="Your full name"
          class="form-input"
          :class="{ error: formErrors.name }"
          autocomplete="name"
        />
        <span v-if="formErrors.name" class="error-message">{{ formErrors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="your@email.com"
          class="form-input"
          :class="{ error: formErrors.email }"
          autocomplete="email"
        />
        <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          placeholder="Create a secure password"
          class="form-input"
          :class="{ error: formErrors.password }"
          autocomplete="new-password"
        />
        <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          class="form-input"
          :class="{ error: formErrors.confirmPassword }"
          autocomplete="new-password"
        />
        <span v-if="formErrors.confirmPassword" class="error-message">{{ formErrors.confirmPassword }}</span>
      </div>

      <!-- Invite Code Section -->
      <div class="form-group invite-section">
        <label class="checkbox-label">
          <input type="checkbox" v-model="hasInviteCode" class="checkbox" />
          <span>I have an invite code</span>
        </label>

        <div v-if="hasInviteCode" class="invite-input-group">
          <label for="inviteCode">Invite Code (Optional)</label>
          <input
            id="inviteCode"
            :value="inviteCode"
            @input="handleInviteCodeInput"
            type="text"
            maxlength="8"
            placeholder="ABCD1234"
            class="form-input code-input"
            :class="{ error: inviteCodeError }"
          />
          <span v-if="inviteCodeError" class="error-message">{{ inviteCodeError }}</span>
          <p class="help-text">Enter the 8-character code shared by your family admin</p>
        </div>
      </div>

      <div v-if="authStore.error" class="auth-error">
        {{ authStore.error }}
      </div>

      <button 
        type="submit" 
        :disabled="!isValid || authStore.isLoading"
        class="submit-btn"
      >
        {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <div class="form-footer">
      <p>
        Already have an account? 
        <button type="button" @click="switchToLogin" class="link-btn">
          Sign in
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-form {
  max-width: 440px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.register-form h2 {
  text-align: center;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
}

.subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
  font-size: 14px;
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
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input.error {
  border-color: var(--color-error);
}

.error-message {
  color: var(--color-error);
  font-size: 13px;
}

.auth-error {
  background: var(--color-error-bg);
  color: var(--color-error);
  padding: 12px;
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 14px;
}

.submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 14px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.submit-btn:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.form-footer p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;
  font-size: inherit;
  font-weight: 600;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Invite Code Section */
.invite-section {
  padding: var(--spacing-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text);
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.invite-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.code-input {
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 16px;
  text-align: center;
}

.help-text {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .register-form {
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }

  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: var(--spacing-md);
  }

  .register-form h2 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
