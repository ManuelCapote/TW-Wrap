<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types'

interface Emits {
  (e: 'switch-to-register'): void
  (e: 'switch-to-forgot-password'): void
  (e: 'login-success'): void
}

const emit = defineEmits<Emits>()
const authStore = useAuthStore()

const formData = ref<LoginCredentials>({
  email: '',
  password: ''
})

const formErrors = ref<Partial<LoginCredentials>>({})

const isValid = computed(() => {
  return formData.value.email.trim() && 
         formData.value.password.trim() &&
         Object.keys(formErrors.value).length === 0
})

const validateForm = () => {
  formErrors.value = {}
  
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
  
  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm() || authStore.isLoading) return
  
  try {
    authStore.clearError()
    await authStore.login(formData.value)
    emit('login-success')
  } catch (error) {
    // Error is handled by the store
  }
}

const switchToRegister = () => {
  emit('switch-to-register')
}

const switchToForgotPassword = () => {
  emit('switch-to-forgot-password')
}

// Demo credentials helper
const fillDemo = () => {
  formData.value = {
    email: 'demo@family.com',
    password: 'demo123'
  }
}
</script>

<template>
  <div data-role="form-container" data-form-type="login" class="login-form">
    <h2 data-role="form-title">Welcome Back</h2>
    <p data-role="form-description" class="subtitle">Sign in to your family wishlist account</p>

    <form data-role="form" @submit.prevent="handleSubmit" class="form">
      <div data-role="form-group" class="form-group">
        <label for="email" data-role="form-label">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          data-role="form-input"
          data-input-type="email"
          :data-validation-state="formErrors.email ? 'invalid' : 'valid'"
          placeholder="your@email.com"
          class="form-input"
          :class="{ error: formErrors.email }"
          autocomplete="email"
        />
        <span v-if="formErrors.email" data-role="form-error" class="error-message">{{ formErrors.email }}</span>
      </div>

      <div data-role="form-group" class="form-group">
        <div class="password-header">
          <label for="password" data-role="form-label">Password</label>
          <button type="button" data-role="button" data-action="forgot-password" @click="switchToForgotPassword" class="forgot-link">
            Forgot password?
          </button>
        </div>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          data-role="form-input"
          data-input-type="password"
          :data-validation-state="formErrors.password ? 'invalid' : 'valid'"
          placeholder="Enter your password"
          class="form-input"
          :class="{ error: formErrors.password }"
          autocomplete="current-password"
        />
        <span v-if="formErrors.password" data-role="form-error" class="error-message">{{ formErrors.password }}</span>
      </div>

      <div v-if="authStore.error" data-role="alert" data-alert-type="error" class="auth-error">
        {{ authStore.error }}
      </div>

      <button
        type="submit"
        data-role="button"
        data-action="submit"
        :data-loading="authStore.isLoading"
        :disabled="!isValid || authStore.isLoading"
        class="submit-btn"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>

      <div data-role="demo-section" class="demo-helper">
        <button type="button" data-role="button" data-action="fill-demo" @click="fillDemo" class="demo-btn">
          Try Demo Account
        </button>
        <small>Email: demo@family.com, Password: demo123</small>
      </div>
    </form>

    <div data-role="form-footer" class="form-footer">
      <p>
        Don't have an account?
        <button type="button" data-role="button" data-action="switch-to-register" @click="switchToRegister" class="link-btn">
          Create one
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 440px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.login-form h2 {
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

.password-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.forgot-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.forgot-link:hover {
  opacity: 0.8;
  text-decoration: underline;
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

.demo-helper {
  text-align: center;
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
}

.demo-btn {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: var(--color-border);
}

.demo-helper small {
  display: block;
  color: var(--color-text-secondary);
  font-size: 12px;
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .login-form {
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }

  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: var(--spacing-md);
  }

  .login-form h2 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 13px;
  }
}
</style>
