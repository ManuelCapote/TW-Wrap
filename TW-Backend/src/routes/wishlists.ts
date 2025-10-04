import { Router } from 'express'
import { database } from '../services/database'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse, WishListItem } from '../types'

const router = Router()

// Get current user's wishlist
router.get('/my', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const items = database.getWishlistItems(userId)

  const response: ApiResponse = {
    success: true,
    data: items,
    message: 'Wishlist retrieved successfully'
  }

  res.json(response)
}))

// Get family's wishlists
router.get('/family', authenticateToken, asyncHandler(async (req, res) => {
  const familyId = req.user!.familyId
  const items = database.getWishlistItems(undefined, familyId)

  // Group items by user
  const itemsByUser: { [userId: string]: WishListItem[] } = {}
  items.forEach(item => {
    if (!itemsByUser[item.userId]) {
      itemsByUser[item.userId] = []
    }
    itemsByUser[item.userId].push(item)
  })

  // Add user information
  const result = Object.keys(itemsByUser).map(userId => {
    const user = database.getUserById(userId)
    return {
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      } : null,
      items: itemsByUser[userId]
    }
  })

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Family wishlists retrieved successfully'
  }

  res.json(response)
}))

// Get specific user's wishlist (family members only)
router.get('/user/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { userId } = req.params
  const requestingUser = database.getUserById(req.user!.userId)
  const targetUser = database.getUserById(userId)

  if (!requestingUser || !targetUser) {
    throw createError('User not found', 404)
  }

  // Check if users are in the same family
  if (requestingUser.familyId !== targetUser.familyId) {
    throw createError('Access denied - not in same family', 403)
  }

  const items = database.getWishlistItems(userId)

  const response: ApiResponse = {
    success: true,
    data: {
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        avatar: targetUser.avatar
      },
      items
    },
    message: 'User wishlist retrieved successfully'
  }

  res.json(response)
}))

// Create new wishlist item
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const itemData = {
    ...req.body,
    userId,
    isPurchased: false
  }

  // Validate required fields
  if (!itemData.title || !itemData.url) {
    throw createError('Title and URL are required', 400)
  }

  const item = database.createWishlistItem(itemData)

  const response: ApiResponse = {
    success: true,
    data: item,
    message: 'Wishlist item created successfully'
  }

  res.status(201).json(response)
}))

// Update wishlist item
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user!.userId

  const existingItem = database.getWishlistItemById(id)
  if (!existingItem) {
    throw createError('Wishlist item not found', 404)
  }

  // Check if user owns this item
  if (existingItem.userId !== userId) {
    throw createError('Access denied - you can only edit your own items', 403)
  }

  const updatedItem = database.updateWishlistItem(id, req.body)

  const response: ApiResponse = {
    success: true,
    data: updatedItem,
    message: 'Wishlist item updated successfully'
  }

  res.json(response)
}))

// Delete wishlist item
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user!.userId

  const existingItem = database.getWishlistItemById(id)
  if (!existingItem) {
    throw createError('Wishlist item not found', 404)
  }

  // Check if user owns this item
  if (existingItem.userId !== userId) {
    throw createError('Access denied - you can only delete your own items', 403)
  }

  const deleted = database.deleteWishlistItem(id)
  if (!deleted) {
    throw createError('Failed to delete wishlist item', 500)
  }

  const response: ApiResponse = {
    success: true,
    message: 'Wishlist item deleted successfully'
  }

  res.json(response)
}))

// Mark item as purchased (family members can do this)
router.patch('/:id/purchase', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user!.userId
  const { isPurchased } = req.body

  const existingItem = database.getWishlistItemById(id)
  if (!existingItem) {
    throw createError('Wishlist item not found', 404)
  }

  // Check if user is in the same family as the item owner
  const itemOwner = database.getUserById(existingItem.userId)
  const requestingUser = database.getUserById(userId)

  if (!itemOwner || !requestingUser) {
    throw createError('User not found', 404)
  }

  if (itemOwner.familyId !== requestingUser.familyId) {
    throw createError('Access denied - not in same family', 403)
  }

  const updates: Partial<WishListItem> = {
    isPurchased: !!isPurchased
  }

  if (isPurchased) {
    updates.purchasedBy = userId
    updates.purchasedAt = new Date()
  } else {
    updates.purchasedBy = undefined
    updates.purchasedAt = undefined
  }

  const updatedItem = database.updateWishlistItem(id, updates)

  const response: ApiResponse = {
    success: true,
    data: updatedItem,
    message: `Item marked as ${isPurchased ? 'purchased' : 'not purchased'}`
  }

  res.json(response)
}))

export default router