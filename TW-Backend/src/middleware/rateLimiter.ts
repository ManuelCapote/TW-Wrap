import { Request, Response, NextFunction } from 'express'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 1000 // requests per window

  // Clean up old entries
  Object.keys(store).forEach(k => {
    if (store[k].resetTime < now) {
      delete store[k]
    }
  })

  // Initialize or get current count
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[key].count++
  }

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - store[key].count).toString(),
    'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString()
  })

  // Check if limit exceeded
  if (store[key].count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
    })
  }

  next()
}