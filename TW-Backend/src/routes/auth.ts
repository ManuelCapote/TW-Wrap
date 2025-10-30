import { Router, Request, Response } from 'express'
import { authService } from '../services/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse, LoginCredentials, CreateUserData } from '../types'

const router = Router()

// Register new user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const userData: CreateUserData = req.body

  const result = await authService.register(userData)

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'User registered successfully'
  }

  res.status(201).json(response)
}))

// Login user
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const credentials: LoginCredentials = req.body

  const result = await authService.login(credentials)

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Login successful'
  }

  res.json(response)
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token is required'
    })
  }

  const result = await authService.refreshToken(token)

  const response: ApiResponse = {
    success: true,
    data: result,
    message: 'Token refreshed successfully'
  }

  res.json(response)
}))

// Verify token (protected route to check if token is valid)
router.get('/verify', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      user: req.user,
      isValid: true
    },
    message: 'Token is valid'
  }

  res.json(response)
}))

// Logout (for completeness - mainly clears client-side data)
router.post('/logout', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // In a real app with database sessions, you'd invalidate the token here
  // For now, we just return success - client handles token removal

  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully'
  }

  res.json(response)
}))

// Request password reset
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    })
  }

  // Call auth service to request password reset
  // Note: Always returns success to prevent email enumeration attacks
  await authService.requestPasswordReset(email)

  const response: ApiResponse = {
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent'
  }

  res.json(response)
}))

// Reset password with token
router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      error: 'Token and password are required'
    })
  }

  // Reset password using token
  await authService.resetPassword(token, password)

  const response: ApiResponse = {
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.'
  }

  res.json(response)
}))

// Validate reset token (optional - for frontend to check if token is valid before showing form)
router.get('/validate-reset-token/:token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params

  const isValid = await authService.validateResetToken(token)

  const response: ApiResponse = {
    success: true,
    data: { isValid },
    message: isValid ? 'Token is valid' : 'Token is invalid or expired'
  }

  res.json(response)
}))

export default router