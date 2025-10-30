import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { wishlistApi, type CreateWishlistItemRequest, type UpdateWishlistItemRequest, type FamilyWishlistsResponse } from '@/services/wishlistApi'
import type { WishListItem } from '@/types'

export const useWishlistStore = defineStore('wishlist', () => {
  // State
  const myWishlist = ref<WishListItem[]>([])
  const familyWishlists = ref<FamilyWishlistsResponse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalItems = computed(() => myWishlist.value.length)

  const purchasedItems = computed(() =>
    myWishlist.value.filter(item => item.isPurchased).length
  )

  const pendingItems = computed(() =>
    myWishlist.value.filter(item => !item.isPurchased).length
  )

  const highPriorityItems = computed(() =>
    myWishlist.value.filter(item => item.priority === 'high' && !item.isPurchased).length
  )

  const completionPercentage = computed(() => {
    if (totalItems.value === 0) return 0
    return Math.round((purchasedItems.value / totalItems.value) * 100)
  })

  const hasItems = computed(() => totalItems.value > 0)

  const currentUserId = computed(() => {
    const authStore = useAuthStore()
    return authStore.user?.id || ''
  })

  /**
   * Get wishlist for a specific family member
   */
  const getWishlistByUserId = computed(() => (userId: string) => {
    return familyWishlists.value.find(w => w.userId === userId)
  })

  /**
   * Get all items from a specific family member
   */
  const getItemsByUserId = computed(() => (userId: string) => {
    const wishlist = familyWishlists.value.find(w => w.userId === userId)
    return wishlist?.items || []
  })

  // Actions

  /**
   * Fetch current user's wishlist
   */
  const fetchMyWishlist = async () => {
    try {
      isLoading.value = true
      error.value = null
      myWishlist.value = await wishlistApi.getMyWishlist()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load wishlist'
      console.error('Error fetching wishlist:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all family members' wishlists
   */
  const fetchFamilyWishlists = async () => {
    try {
      isLoading.value = true
      error.value = null
      familyWishlists.value = await wishlistApi.getFamilyWishlists()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load family wishlists'
      console.error('Error fetching family wishlists:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a specific user's wishlist
   */
  const fetchUserWishlist = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null
      const items = await wishlistApi.getUserWishlist(userId)

      // Update the family wishlists cache
      const existingIndex = familyWishlists.value.findIndex(w => w.userId === userId)
      if (existingIndex >= 0) {
        familyWishlists.value[existingIndex].items = items
      }

      return items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user wishlist'
      console.error('Error fetching user wishlist:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new wishlist item
   */
  const createItem = async (item: CreateWishlistItemRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const newItem = await wishlistApi.createItem(item)

      // Add to local state
      myWishlist.value.push(newItem)

      return newItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create item'
      console.error('Error creating wishlist item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a wishlist item
   */
  const updateItem = async (id: string, updates: UpdateWishlistItemRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const updatedItem = await wishlistApi.updateItem(id, updates)

      // Update in local state
      const index = myWishlist.value.findIndex(item => item.id === id)
      if (index >= 0) {
        myWishlist.value[index] = updatedItem
      }

      return updatedItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update item'
      console.error('Error updating wishlist item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a wishlist item
   */
  const deleteItem = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      await wishlistApi.deleteItem(id)

      // Remove from local state
      myWishlist.value = myWishlist.value.filter(item => item.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete item'
      console.error('Error deleting wishlist item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle purchase status of an item
   */
  const togglePurchaseStatus = async (id: string, isPurchased: boolean, userId?: string) => {
    try {
      isLoading.value = true
      error.value = null
      const updatedItem = await wishlistApi.togglePurchaseStatus(id, isPurchased)

      // Update in local state if it's user's own wishlist
      if (!userId || userId === currentUserId.value) {
        const index = myWishlist.value.findIndex(item => item.id === id)
        if (index >= 0) {
          myWishlist.value[index] = updatedItem
        }
      }

      // Update in family wishlists cache
      if (userId) {
        const wishlistIndex = familyWishlists.value.findIndex(w => w.userId === userId)
        if (wishlistIndex >= 0) {
          const itemIndex = familyWishlists.value[wishlistIndex].items.findIndex(item => item.id === id)
          if (itemIndex >= 0) {
            familyWishlists.value[wishlistIndex].items[itemIndex] = updatedItem
          }
        }
      }

      return updatedItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update purchase status'
      console.error('Error toggling purchase status:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mark item as purchased
   */
  const markAsPurchased = async (id: string, userId?: string) => {
    return togglePurchaseStatus(id, true, userId)
  }

  /**
   * Mark item as unpurchased
   */
  const markAsUnpurchased = async (id: string, userId?: string) => {
    return togglePurchaseStatus(id, false, userId)
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    myWishlist.value = []
    familyWishlists.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    myWishlist,
    familyWishlists,
    isLoading,
    error,

    // Getters
    totalItems,
    purchasedItems,
    pendingItems,
    highPriorityItems,
    completionPercentage,
    hasItems,
    currentUserId,
    getWishlistByUserId,
    getItemsByUserId,

    // Actions
    fetchMyWishlist,
    fetchFamilyWishlists,
    fetchUserWishlist,
    createItem,
    updateItem,
    deleteItem,
    togglePurchaseStatus,
    markAsPurchased,
    markAsUnpurchased,
    clearError,
    reset
  }
})
