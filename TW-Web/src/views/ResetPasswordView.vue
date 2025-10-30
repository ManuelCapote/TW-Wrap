<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Gift } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const token = ref('')
const isValidatingToken = ref(true)
const isTokenValid = ref(false)
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const isValid = computed(() => {
  return (
    password.value.trim() &&
    confirmPassword.value.trim() &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

const validatePassword = () => {
  passwordError.value = ''

  if (!password.value.trim()) {
    passwordError.value = 'Password is required'
    return false
  }

  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }

  return true
}

const validateConfirmPassword = () => {
  confirmPasswordError.value = ''

  if (!confirmPassword.value.trim()) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }

  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }

  return true
}

const validateToken = async () => {
  isValidatingToken.value = true

  try {
    const response = await fetch(
      `http://localhost:3000/api/auth/validate-reset-token/${token.value}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!data.success || !data.data?.isValid) {
      isTokenValid.value = false
    } else {
      isTokenValid.value = true
    }
  } catch (err) {
    console.error('Token validation error:', err)
    isTokenValid.value = false
  } finally {
    isValidatingToken.value = false
  }
}

const handleSubmit = async () => {
  if (!validatePassword() || !validateConfirmPassword() || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to reset password')
    }

    successMessage.value = data.message || 'Password reset successfully!'

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth')
    }, 2000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Extract token from query parameter
  const tokenParam = route.query.token as string
  if (tokenParam) {
    token.value = tokenParam
    validateToken()
  } else {
    isValidatingToken.value = false
    isTokenValid.value = false
  }
})
</script>

<template>
  <div data-role="page-container" class="reset-password-view">
    <div data-role="content-wrapper" class="reset-password-container">
      <div data-role="auth-header" class="auth-header">
        <h1 class="logo">
          <Gift data-role="logo-icon" :size="32" :stroke-width="2" class="logo-icon" />
          TW-Web
        </h1>
        <p data-role="tagline" class="tagline">Share wishlists, give perfect gifts</p>
      </div>

      <!-- Loading state while validating token -->
      <div v-if="isValidatingToken" class="reset-password-card">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Validating reset link...</p>
        </div>
      </div>

      <!-- Invalid or expired token -->
      <div v-else-if="!isTokenValid" class="reset-password-card">
        <div class="error-state">
          <div class="error-icon">✗</div>
          <h2>Invalid or Expired Link</h2>
          <p>This password reset link is invalid or has expired.</p>
          <p class="help-text">
            Password reset links expire after 30 minutes for security reasons.
          </p>
          <router-link to="/auth" class="primary-btn">
            Back to Login
          </router-link>
        </div>
      </div>

      <!-- Valid token - show reset form -->
      <div v-else-if="!successMessage" class="reset-password-card">
        <h2>Create New Password</h2>
        <p class="subtitle">Enter a new password for your account</p>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter new password"
              class="form-input"
              :class="{ error: passwordError }"
              autocomplete="new-password"
              :disabled="isLoading"
              @blur="validatePassword"
            />
            <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
            <span v-else class="help-text">Must be at least 6 characters</span>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
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
            <span v-if="confirmPasswordError" class="error-message">{{
              confirmPasswordError
            }}</span>
          </div>

          <div v-if="error" class="auth-error">
            {{ error }}
          </div>

          <button type="submit" :disabled="!isValid || isLoading" class="submit-btn">
            {{ isLoading ? 'Resetting Password...' : 'Reset Password' }}
          </button>
        </form>

        <div class="form-footer">
          <router-link to="/auth" class="link-btn"> ← Back to Login </router-link>
        </div>
      </div>

      <!-- Success state -->
      <div v-else class="reset-password-card">
        <div class="success-state">
          <div class="success-icon">✓</div>
          <h2>Password Reset Successfully!</h2>
          <p>{{ successMessage }}</p>
          <p class="help-text">Redirecting you to login...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--spacing-lg);
}

.reset-password-container {
  width: 100%;
  max-width: 480px;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-sm) 0;
}

.logo-icon {
  color: var(--color-primary);
}

.tagline {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin: 0;
}

.reset-password-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

.reset-password-card h2 {
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

.help-text {
  font-size: 13px;
  color: var(--color-text-tertiary);
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

.link-btn {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.link-btn:hover {
  opacity: 0.8;
}

.primary-btn {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease;
  margin-top: var(--spacing-lg);
}

.primary-btn:hover {
  background: var(--color-primary-hover);
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-lg);
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-text-secondary);
  font-size: 15px;
}

/* Error state */
.error-state {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  background: var(--color-error);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.error-state h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}

.error-state p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
}

/* Success state */
.success-state {
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

.success-state h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}

.success-state p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .reset-password-card {
    padding: var(--spacing-lg);
  }

  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .reset-password-view {
    padding: var(--spacing-md);
  }

  .reset-password-card {
    padding: var(--spacing-md);
  }

  .reset-password-card h2 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
