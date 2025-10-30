import { Router } from 'express'
import { database } from '../services/database'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse } from '../types'
import bcrypt from 'bcryptjs'

const router = Router()

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await database.getUserById(req.user!.userId)

  if (!user) {
    throw createError('User not found', 404)
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User profile retrieved successfully'
  }

  res.json(response)
}))

// Update current user profile
router.put('/me', authenticateToken, asyncHandler(async (req, res) => {
  const { name, avatar } = req.body
  const userId = req.user!.userId

  const updates: any = {}
  if (name) updates.name = name.trim()
  if (avatar) updates.avatar = avatar

  const updatedUser = await database.updateUser(userId, updates)

  if (!updatedUser) {
    throw createError('User not found', 404)
  }

  const response: ApiResponse = {
    success: true,
    data: updatedUser,
    message: 'User profile updated successfully'
  }

  res.json(response)
}))

// Change password (authenticated users)
router.put('/me/password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user!.userId

  // Validate input
  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400)
  }

  if (newPassword.length < 6) {
    throw createError('New password must be at least 6 characters', 400)
  }

  // Get current password hash
  const currentPasswordHash = await database.getUserPassword(userId)
  if (!currentPasswordHash) {
    throw createError('User not found', 404)
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, currentPasswordHash)
  if (!isValidPassword) {
    throw createError('Current password is incorrect', 401)
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12)

  // Update password
  await database.updateUserPassword(userId, newPasswordHash)

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully'
  }

  res.json(response)
}))

// Delete current user account
router.delete('/me', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId

  // Get user to check if they're the last family member
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  const family = await database.getFamilyById(user.familyId)
  if (!family) {
    throw createError('Family not found', 404)
  }

  // Check if user is the last member of the family
  if (family.members.length === 1) {
    // Delete the family as well (it will be empty after user deletion)
    // The cascade delete will handle this through Prisma schema
  }

  // Delete user (cascades to wishlist items, reset tokens, etc.)
  const deleted = await database.deleteUser(userId)

  if (!deleted) {
    throw createError('Failed to delete account', 500)
  }

  const response: ApiResponse = {
    success: true,
    message: 'Account deleted successfully'
  }

  res.json(response)
}))

// Get user by ID (for family members to view each other)
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params
  const requestingUser = await database.getUserById(req.user!.userId)

  if (!requestingUser) {
    throw createError('Requesting user not found', 404)
  }

  const targetUser = await database.getUserById(id)

  if (!targetUser) {
    throw createError('User not found', 404)
  }

  // Check if users are in the same family
  if (requestingUser.familyId !== targetUser.familyId) {
    throw createError('Access denied - not in same family', 403)
  }

  const response: ApiResponse = {
    success: true,
    data: targetUser,
    message: 'User retrieved successfully'
  }

  res.json(response)
}))

export default router
