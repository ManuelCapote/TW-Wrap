<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types'

interface Emits {
  (e: 'switch-to-register'): void
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

// Demo credentials helper
const fillDemo = () => {
  formData.value = {
    email: 'demo@family.com',
    password: 'demo123'
  }
}
</script>

<template>
  <div class="login-form">
    <h2>Welcome Back</h2>
    <p class="subtitle">Sign in to your family wishlist account</p>
    
    <form @submit.prevent="handleSubmit" class="form">
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
          placeholder="Enter your password"
          class="form-input"
          :class="{ error: formErrors.password }"
          autocomplete="current-password"
        />
        <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
      </div>

      <div v-if="authStore.error" class="auth-error">
        {{ authStore.error }}
      </div>

      <button 
        type="submit" 
        :disabled="!isValid || authStore.isLoading"
        class="submit-btn"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>

      <div class="demo-helper">
        <button type="button" @click="fillDemo" class="demo-btn">
          Try Demo Account
        </button>
        <small>Email: demo@family.com, Password: demo123</small>
      </div>
    </form>

    <div class="form-footer">
      <p>
        Don't have an account? 
        <button type="button" @click="switchToRegister" class="link-btn">
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
