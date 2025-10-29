import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import wishlistRoutes from './routes/wishlists'
import familyRoutes from './routes/families'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0)

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

// Security middleware
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  credentials: true
}))

// Logging
app.use(morgan('combined'))

// Rate limiting
app.use(rateLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TW-Web Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Simple test route first
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/wishlists', wishlistRoutes)
app.use('/api/families', familyRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Global error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TW-Web Backend API is running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app
