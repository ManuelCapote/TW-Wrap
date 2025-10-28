import { Router } from 'express'
import { database } from '../services/database'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse } from '../types'

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
