<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="app">
    <header v-if="authStore.isAuthenticated" class="header">
      <div class="header-content">
        <RouterLink to="/" class="logo">TW</RouterLink>

        <nav class="nav">
          <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/my-wishlist" class="nav-link">Wishlist</RouterLink>
          <RouterLink to="/family" class="nav-link">Family</RouterLink>
          <RouterLink to="/settings" class="nav-link">Settings</RouterLink>
        </nav>

        <div class="user-section">
          <ThemeToggle />
          <div class="user-avatar">{{ authStore.userAvatar }}</div>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>

    <div v-else class="guest-theme-toggle">
      <ThemeToggle />
    </div>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.logo:hover {
  text-decoration: none;
}

.nav {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--color-background);
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.nav-link {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--color-surface);
  color: var(--color-primary);
  text-decoration: none;
}

.nav-link.router-link-active {
  background: var(--color-primary);
  color: white;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
}

.logout-btn {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--color-surface);
  color: var(--color-error);
  border-color: var(--color-error);
}

.main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  width: 100%;
}

.guest-theme-toggle {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md);
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .nav-link {
    flex: 1;
    text-align: center;
    padding: var(--spacing-sm);
    font-size: 14px;
  }

  .main {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .guest-theme-toggle {
    justify-content: center;
    padding: var(--spacing-md) var(--spacing-lg) 0;
  }

  .user-section {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
