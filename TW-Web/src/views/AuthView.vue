<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Gift } from 'lucide-vue-next'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentView = ref<'login' | 'register'>('login')

const switchToLogin = () => {
  currentView.value = 'login'
  authStore.clearError()
}

const switchToRegister = () => {
  currentView.value = 'register'
  authStore.clearError()
}

const handleAuthSuccess = () => {
  // Redirect to dashboard after successful login/register
  router.push('/')
}

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<template>
  <div data-role="page-container" class="auth-view">
    <div data-role="content-wrapper" class="auth-container">
      <div data-role="auth-header" class="auth-header">
        <h1 class="logo">
          <Gift data-role="logo-icon" :size="32" :stroke-width="2" class="logo-icon" />
          TW-Web
        </h1>
        <p data-role="tagline" class="tagline">Share wishlists, give perfect gifts</p>
      </div>

      <div data-role="auth-content" class="auth-content">
        <Transition name="slide" mode="out-in">
          <LoginForm
            v-if="currentView === 'login'"
            @switch-to-register="switchToRegister"
            @login-success="handleAuthSuccess"
          />
          <RegisterForm
            v-else
            @switch-to-login="switchToLogin"
            @register-success="handleAuthSuccess"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-header {
  text-align: center;
  margin-bottom: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.logo-icon {
  color: var(--color-primary);
}

.tagline {
  color: var(--color-text);
  opacity: 0.8;
  margin: 0;
  font-size: 1.1rem;
}

.auth-content {
  position: relative;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .auth-view {
    padding: 1rem;
  }
  
  .logo {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 1rem;
  }
  
  .auth-header {
    margin-bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .auth-view {
    padding: 0.5rem;
  }
  
  .logo {
    font-size: 1.75rem;
  }
  
  .tagline {
    font-size: 0.9rem;
  }
  
  .auth-header {
    margin-bottom: 1.5rem;
  }
}
</style>