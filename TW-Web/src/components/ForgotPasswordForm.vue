<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

interface Emits {
  (e: 'back-to-login'): void
}

const emit = defineEmits<Emits>()
const toast = useToast()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const emailError = ref('')

const isValid = computed(() => {
  return email.value.trim() && !emailError.value
})

const validateEmail = () => {
  emailError.value = ''

  if (!email.value.trim()) {
    emailError.value = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateEmail() || isLoading.value) return

  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value.trim() })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to send reset email')
    }

    successMessage.value = data.message || 'Check your email for a password reset link'
    toast.success('Password reset email sent!')
    email.value = '' // Clear the form
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred. Please try again.'
    toast.error('Failed to send password reset email')
  } finally {
    isLoading.value = false
  }
}

const backToLogin = () => {
  emit('back-to-login')
}
</script>

<template>
  <div data-role="form-container" data-form-type="forgot-password" class="forgot-password-form">
    <h2 data-role="form-title">Reset Password</h2>
    <p data-role="form-description" class="subtitle">Enter your email address and we'll send you a link to reset your password</p>

    <form v-if="!successMessage" data-role="form" @submit.prevent="handleSubmit" class="form">
      <div data-role="form-group" class="form-group">
        <label for="email" data-role="form-label">Email Address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          data-role="form-input"
          data-input-type="email"
          :data-validation-state="emailError ? 'invalid' : 'valid'"
          placeholder="your@email.com"
          class="form-input"
          :class="{ error: emailError }"
          autocomplete="email"
          :disabled="isLoading"
        />
        <span v-if="emailError" data-role="form-error" class="error-message">{{ emailError }}</span>
      </div>

      <div v-if="error" data-role="alert" data-alert-type="error" class="auth-error">
        {{ error }}
      </div>

      <button
        type="submit"
        data-role="button"
        data-action="submit"
        :data-loading="isLoading"
        :disabled="!isValid || isLoading"
        class="submit-btn"
      >
        {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>

    <div v-else data-role="success-card" class="success-card">
      <div class="success-icon">✓</div>
      <h3>Check Your Email</h3>
      <p>{{ successMessage }}</p>
      <p class="help-text">
        Didn't receive the email? Check your spam folder or try again in a few minutes.
      </p>
    </div>

    <div data-role="form-footer" class="form-footer">
      <button type="button" data-role="button" data-action="back-to-login" @click="backToLogin" class="link-btn">
        ← Back to Login
      </button>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-form {
  max-width: 440px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.forgot-password-form h2 {
  text-align: center;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
}

.subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xl) 0;
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
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.success-card {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.success-card h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}

.success-card p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
}

.help-text {
  font-size: 13px !important;
  color: var(--color-text-tertiary) !important;
  margin-top: var(--spacing-lg) !important;
}

.form-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: var(--spacing-sm) 0;
  transition: opacity 0.2s ease;
}

.link-btn:hover {
  opacity: 0.8;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .forgot-password-form {
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }

  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .forgot-password-form {
    padding: var(--spacing-md);
  }

  .forgot-password-form h2 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
