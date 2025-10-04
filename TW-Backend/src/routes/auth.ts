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

export default router