import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}))

app.use(express.json())

// Simple test routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TW-Web Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    time: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TW-Web Backend API is running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`)
})

export default app