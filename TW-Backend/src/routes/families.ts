import { Router } from 'express'
import { database } from '../services/database'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse } from '../types'

const router = Router()

// Get current user's family
router.get('/my', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const family = await database.getFamilyByUserId(userId)

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
  const family = await database.getFamilyByUserId(userId)

  if (!family) {
    throw createError('Family not found', 404)
  }

  // Return members with role info
  const members = family.members.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    role: member.role,
    createdAt: member.createdAt
  }))

  const response: ApiResponse = {
    success: true,
    data: members,
    message: 'Family members retrieved successfully'
  }

  res.json(response)
}))

// Update family name (ADMIN only)
router.put('/my', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const { name } = req.body

  if (!name || name.trim().length === 0) {
    throw createError('Family name is required', 400)
  }

  // Get user and check if they're admin
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  if (user.role !== 'ADMIN') {
    throw createError('Only family admins can update family name', 403)
  }

  const updatedFamily = await database.updateFamilyName(user.familyId, name.trim())

  if (!updatedFamily) {
    throw createError('Family not found', 404)
  }

  const response: ApiResponse = {
    success: true,
    data: updatedFamily,
    message: 'Family name updated successfully'
  }

  res.json(response)
}))

// Create a new family invite code (ADMIN only)
router.post('/invites', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const { expiresInDays = 7, maxUses = 10 } = req.body

  // Get user and check if they're admin
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  if (user.role !== 'ADMIN') {
    throw createError('Only family admins can create invite codes', 403)
  }

  const invite = await database.createFamilyInvite(
    user.familyId,
    userId,
    expiresInDays,
    maxUses
  )

  const response: ApiResponse = {
    success: true,
    data: invite,
    message: 'Invite code created successfully'
  }

  res.json(response)
}))

// Get all active invites for current family (ADMIN only)
router.get('/invites', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId

  // Get user and check if they're admin
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  if (user.role !== 'ADMIN') {
    throw createError('Only family admins can view invite codes', 403)
  }

  const invites = await database.getInvitesByFamilyId(user.familyId, true)

  const response: ApiResponse = {
    success: true,
    data: invites,
    message: 'Invites retrieved successfully'
  }

  res.json(response)
}))

// Revoke an invite code (ADMIN only)
router.delete('/invites/:code', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const { code } = req.params

  // Get user and check if they're admin
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  if (user.role !== 'ADMIN') {
    throw createError('Only family admins can revoke invite codes', 403)
  }

  // Verify the invite belongs to this family
  const invite = await database.getFamilyInviteByCode(code)
  if (invite && invite.familyId !== user.familyId) {
    throw createError('Invite not found', 404)
  }

  const success = await database.revokeInvite(code)

  if (!success) {
    throw createError('Failed to revoke invite', 400)
  }

  const response: ApiResponse = {
    success: true,
    data: { code },
    message: 'Invite code revoked successfully'
  }

  res.json(response)
}))

// Join a family using invite code
router.post('/join', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId
  const { inviteCode } = req.body

  if (!inviteCode) {
    throw createError('Invite code is required', 400)
  }

  // Get the invite and validate it
  const invite = await database.getFamilyInviteByCode(inviteCode.trim().toUpperCase())

  if (!invite) {
    throw createError('Invalid or expired invite code', 400)
  }

  // Get current user
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  // Check if user is already in this family
  if (user.familyId === invite.familyId) {
    throw createError('You are already a member of this family', 400)
  }

  // Update user's family and increment invite usage
  const updatedUser = await database.updateUserFamily(userId, invite.familyId)
  await database.useFamilyInvite(inviteCode.trim().toUpperCase())

  if (!updatedUser) {
    throw createError('Failed to join family', 500)
  }

  // Get the new family info
  const newFamily = await database.getFamilyById(invite.familyId)

  const response: ApiResponse = {
    success: true,
    data: {
      user: updatedUser,
      family: newFamily
    },
    message: 'Successfully joined family'
  }

  res.json(response)
}))

// Remove a member from family (ADMIN only)
router.delete('/members/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const adminUserId = req.user!.userId
  const { userId: memberToRemoveId } = req.params

  // Get admin user and check if they're admin
  const adminUser = await database.getUserById(adminUserId)
  if (!adminUser) {
    throw createError('User not found', 404)
  }

  if (adminUser.role !== 'ADMIN') {
    throw createError('Only family admins can remove members', 403)
  }

  // Get member to remove
  const memberToRemove = await database.getUserById(memberToRemoveId)
  if (!memberToRemove) {
    throw createError('Member not found', 404)
  }

  // Check if member is in same family
  if (memberToRemove.familyId !== adminUser.familyId) {
    throw createError('Member is not in your family', 404)
  }

  // Can't remove yourself
  if (memberToRemoveId === adminUserId) {
    throw createError('You cannot remove yourself from the family', 400)
  }

  // Can't remove other admins
  if (memberToRemove.role === 'ADMIN') {
    throw createError('Cannot remove another admin', 403)
  }

  const success = await database.removeFamilyMember(memberToRemoveId)

  if (!success) {
    throw createError('Failed to remove member', 500)
  }

  const response: ApiResponse = {
    success: true,
    data: { userId: memberToRemoveId },
    message: 'Member removed successfully'
  }

  res.json(response)
}))

// Leave current family (creates new family for user)
router.post('/leave', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId

  // Get user
  const user = await database.getUserById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }

  // Can't leave if you're the only member
  const currentFamily = await database.getFamilyById(user.familyId)
  if (!currentFamily) {
    throw createError('Family not found', 404)
  }

  if (currentFamily.members.length === 1) {
    throw createError('Cannot leave family - you are the only member', 400)
  }

  // If user is admin, they need to transfer ownership first
  if (user.role === 'ADMIN') {
    throw createError('Admins must transfer ownership before leaving', 400)
  }

  // Create new family for the user
  const newFamily = await database.createFamily(`${user.name}'s Family`, userId)

  // Move user to new family
  const updatedUser = await database.updateUserFamily(userId, newFamily.id)

  if (!updatedUser) {
    throw createError('Failed to leave family', 500)
  }

  const response: ApiResponse = {
    success: true,
    data: {
      user: updatedUser,
      newFamily
    },
    message: 'Successfully left family'
  }

  res.json(response)
}))

export default router
