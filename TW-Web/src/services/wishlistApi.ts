import type { WishListItem } from '@/types'

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
 * Convert date strings from API to Date objects
 */
function convertDates(item: WishListItem): WishListItem {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    ...(item.purchasedAt ? { purchasedAt: new Date(item.purchasedAt) } : {})
  }
}

/**
 * Request/Response types for wishlist API
 */
export interface CreateWishlistItemRequest {
  title: string
  description?: string
  url?: string
  imageUrl?: string
  price?: number
  currency?: string
  store?: string
  quantity: number
  priority: 'low' | 'medium' | 'high'
}

export interface UpdateWishlistItemRequest {
  title?: string
  description?: string
  url?: string
  imageUrl?: string
  price?: number
  currency?: string
  store?: string
  quantity?: number
  priority?: 'low' | 'medium' | 'high'
}

export interface PurchaseStatusRequest {
  isPurchased: boolean
}

export interface FamilyWishlistsResponse {
  userId: string
  userName: string
  userEmail: string
  items: WishListItem[]
}

/**
 * Wishlist Management API Service
 */
export const wishlistApi = {
  /**
   * Get current user's wishlist
   */
  async getMyWishlist(): Promise<WishListItem[]> {
    const response = await fetch(`${BASE_URL}/wishlists/my`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const items = await handleResponse<WishListItem[]>(response)
    return items.map(convertDates)
  },

  /**
   * Get all family members' wishlists
   */
  async getFamilyWishlists(): Promise<FamilyWishlistsResponse[]> {
    const response = await fetch(`${BASE_URL}/wishlists/family`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const data = await handleResponse<FamilyWishlistsResponse[]>(response)

    // Convert dates for all items in all wishlists
    return data.map(wishlist => ({
      ...wishlist,
      items: wishlist.items.map(convertDates)
    }))
  },

  /**
   * Get specific user's wishlist (family members only)
   */
  async getUserWishlist(userId: string): Promise<WishListItem[]> {
    const response = await fetch(`${BASE_URL}/wishlists/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const items = await handleResponse<WishListItem[]>(response)
    return items.map(convertDates)
  },

  /**
   * Create a new wishlist item
   */
  async createItem(item: CreateWishlistItemRequest): Promise<WishListItem> {
    const response = await fetch(`${BASE_URL}/wishlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    })
    const data = await handleResponse<WishListItem>(response)
    return convertDates(data)
  },

  /**
   * Update a wishlist item (owner only)
   */
  async updateItem(id: string, updates: UpdateWishlistItemRequest): Promise<WishListItem> {
    const response = await fetch(`${BASE_URL}/wishlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    const data = await handleResponse<WishListItem>(response)
    return convertDates(data)
  },

  /**
   * Delete a wishlist item (owner only)
   */
  async deleteItem(id: string): Promise<{ id: string }> {
    const response = await fetch(`${BASE_URL}/wishlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse<{ id: string }>(response)
  },

  /**
   * Mark item as purchased/unpurchased (family members can mark)
   */
  async togglePurchaseStatus(id: string, isPurchased: boolean): Promise<WishListItem> {
    const response = await fetch(`${BASE_URL}/wishlists/${id}/purchase`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isPurchased })
    })
    const data = await handleResponse<WishListItem>(response)
    return convertDates(data)
  }
}
