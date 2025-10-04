import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const isProduction = process.env.NODE_ENV === 'production'

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  const response: ApiResponse = {
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message,
    message: 'An error occurred while processing your request'
  }

  // Add stack trace in development
  if (!isProduction) {
    ;(response as any).stack = err.stack
  }

  res.status(statusCode).json(response)
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}