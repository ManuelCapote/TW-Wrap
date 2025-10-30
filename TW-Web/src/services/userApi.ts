import type { User } from '@/types'

const BASE_URL = 'http://localhost:3000/api'

/**
 * Get authorization headers with token from localStorage
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tw-web-auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

/**
 * Handle API response and extract data
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || data.message || 'Request failed')
  }

  return data.data
}

/**
 * User Profile Management API Service
 */
export const userApi = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<User>(response)
  },

  /**
   * Update current user profile (name and/or avatar)
   */
  async updateProfile(updates: { name?: string; avatar?: string }): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse<User>(response)
  },

  /**
   * Change user password (requires current password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/users/me/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to change password')
    }

    // No data returned, just success message
    return
  },

  /**
   * Delete current user account permanently
   * This will delete all user data including wishlists
   */
  async deleteAccount(): Promise<void> {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || data.message || 'Failed to delete account')
    }

    // No data returned, just success message
    return
  },

  /**
   * Get another user's profile (same family only)
   */
  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<User>(response)
  }
}
