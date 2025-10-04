import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'
import { createError } from './errorHandler'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return next(createError('Access token required', 401))
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expired', 401))
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid token', 401))
    } else {
      return next(createError('Authentication failed', 401))
    }
  }
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return next()
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    req.user = decoded
  } catch (error) {
    // Ignore errors for optional auth
    console.warn('Optional auth failed:', error instanceof Error ? error.message : error)
  }

  next()
}