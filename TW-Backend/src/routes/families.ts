import { Router } from 'express'
import { database } from '../services/database'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse } from '../types'

const router = Router()

// Get current user's family
router.get('/my', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const family = database.getFamilyByUserId(userId)

  if (!family) {
    throw createError('Family not found', 404)
  }

  const response: ApiResponse = {
    success: true,
    data: family,
    message: 'Family retrieved successfully'
  }

  res.json(response)
}))

// Get family members
router.get('/members', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const family = database.getFamilyByUserId(userId)

  if (!family) {
    throw createError('Family not found', 404)
  }

  // Return members without sensitive info
  const members = family.members.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    createdAt: member.createdAt
  }))

  const response: ApiResponse = {
    success: true,
    data: members,
    message: 'Family members retrieved successfully'
  }

  res.json(response)
}))

export default router