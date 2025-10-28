import type { User, Family, FamilyInvite, CreateInviteRequest, JoinFamilyRequest } from '@/types'

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
 * Family Management API Service
 */
export const familyApi = {
  /**
   * Get current user's family with all members
   */
  async getFamily(): Promise<Family> {
    const response = await fetch(`${BASE_URL}/families/my`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<Family>(response)
  },

  /**
   * Get family members with role information
   */
  async getFamilyMembers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/families/members`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<User[]>(response)
  },

  /**
   * Update family name (ADMIN only)
   */
  async updateFamilyName(name: string): Promise<Family> {
    const response = await fetch(`${BASE_URL}/families/my`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    })
    return handleResponse<Family>(response)
  },

  /**
   * Create a new family invite code (ADMIN only)
   */
  async createInvite(config?: CreateInviteRequest): Promise<FamilyInvite> {
    const response = await fetch(`${BASE_URL}/families/invites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config || {})
    })

    const data = await handleResponse<FamilyInvite>(response)

    // Convert date strings to Date objects
    return {
      ...data,
      expiresAt: new Date(data.expiresAt),
      createdAt: new Date(data.createdAt)
    }
  },

  /**
   * Get all active invites for current family (ADMIN only)
   */
  async getActiveInvites(): Promise<FamilyInvite[]> {
    const response = await fetch(`${BASE_URL}/families/invites`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    const invites = await handleResponse<FamilyInvite[]>(response)

    // Convert date strings to Date objects
    return invites.map(invite => ({
      ...invite,
      expiresAt: new Date(invite.expiresAt),
      createdAt: new Date(invite.createdAt)
    }))
  },

  /**
   * Revoke an invite code (ADMIN only)
   */
  async revokeInvite(code: string): Promise<{ code: string }> {
    const response = await fetch(`${BASE_URL}/families/invites/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse<{ code: string }>(response)
  },

  /**
   * Join a family using an invite code
   */
  async joinFamily(request: JoinFamilyRequest): Promise<{ user: User; family: Family }> {
    const response = await fetch(`${BASE_URL}/families/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    return handleResponse<{ user: User; family: Family }>(response)
  },

  /**
   * Remove a member from family (ADMIN only)
   */
  async removeMember(userId: string): Promise<{ userId: string }> {
    const response = await fetch(`${BASE_URL}/families/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse<{ userId: string }>(response)
  },

  /**
   * Leave current family (creates new family for user)
   */
  async leaveFamily(): Promise<{ user: User; newFamily: Family }> {
    const response = await fetch(`${BASE_URL}/families/leave`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse<{ user: User; newFamily: Family }>(response)
  }
}
