import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: {
        requiresGuest: true,
        title: 'Sign In - TW-Web'
      }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: {
        requiresGuest: true,
        title: 'Reset Password - TW-Web'
      }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { 
        requiresAuth: true,
        title: 'Dashboard - TW-Web'
      }
    },
    {
      path: '/my-wishlist',
      name: 'my-wishlist',
      component: () => import('../views/MyWishlistView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'My Wishlist - TW-Web'
      }
    },
    {
      path: '/family',
      name: 'family',
      component: () => import('../views/FamilyView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Family Wishlists - TW-Web'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Settings - TW-Web'
      }
    },
    {
      path: '/design-spike',
      name: 'design-spike',
      component: () => import('../views/DesignSpike.vue'),
      meta: {
        title: 'Design Spike - TW-Web'
      }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // Initialize auth on first navigation
  if (!authStore.user && !authStore.token) {
    authStore.initializeAuth()
  }
  
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    next('/auth')
  } else if (requiresGuest && isAuthenticated) {
    // Redirect to dashboard if trying to access auth pages while authenticated
    next('/')
  } else {
    next()
  }
})

export default router
