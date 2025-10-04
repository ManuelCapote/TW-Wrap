import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types'

const TOKEN_KEY = 'tw-web-auth-token'
const USER_KEY = 'tw-web-user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userName = computed(() => user.value?.name || 'Guest')
  const userAvatar = computed(() => user.value?.avatar || '👤')

  // Real authentication service - API calls to backend
  const apiService = {
    baseUrl: 'http://localhost:3000/api',

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      console.log('🚀 Attempting login to:', `${this.baseUrl}/auth/login`)
      console.log('📧 Credentials:', { email: credentials.email, password: '***' })
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('📦 Response data:', data)
      
      if (!data.success) {
        throw new Error(data.error || 'Login failed')
      }

      // Convert date strings back to Date objects
      return {
        ...data.data,
        user: {
          ...data.data.user,
          createdAt: new Date(data.data.user.createdAt)
        },
        expiresAt: new Date(data.data.expiresAt)
      }
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed')
      }

      // Convert date strings back to Date objects
      return {
        ...data.data,
        user: {
          ...data.data.user,
          createdAt: new Date(data.data.user.createdAt)
        },
        expiresAt: new Date(data.data.expiresAt)
      }
    },

    async logout(): Promise<void> {
      // Optional: call backend logout endpoint to invalidate token
      // For now, just resolve - cleanup happens on client side
      return Promise.resolve()
    },

    async refreshToken(oldToken: string): Promise<string> {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: oldToken })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Token refresh failed')
      }

      return data.data.token
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.login(credentials)
      
      user.value = response.user
      token.value = response.token
      
      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.register(credentials)
      
      user.value = response.user
      token.value = response.token
      
      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      await apiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      error.value = null
      isLoading.value = false
      
      // Clear localStorage
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }

  const initializeAuth = () => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      
      if (storedToken && storedUser) {
        // Check if it's a mock token (from old system)
        if (storedToken.startsWith('mock-jwt-token-')) {
          console.log('Clearing old mock authentication data')
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          return
        }
        
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err)
      logout()
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userName,
    userAvatar,
    // Actions
    login,
    register,
    logout,
    initializeAuth,
    clearError
  }
})