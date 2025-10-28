import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { database } from './database'
import { AuthUser, AuthResponse, LoginCredentials, CreateUserData, JWTPayload } from '../types'
import { createError } from '../middleware/errorHandler'

// Load environment variables
dotenv.config()

export class AuthService {
  private jwtSecret: string
  private jwtExpiresIn: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || ''
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h'

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET must be configured')
    }
  }

  async register(userData: CreateUserData): Promise<AuthResponse> {
    const { name, email, password } = userData

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email)
    if (existingUser) {
      throw createError('Email already registered', 400)
    }

    // Validate input
    if (!name || name.trim().length < 2) {
      throw createError('Name must be at least 2 characters', 400)
    }

    if (!this.isValidEmail(email)) {
      throw createError('Please provide a valid email address', 400)
    }

    if (!password || password.length < 6) {
      throw createError('Password must be at least 6 characters', 400)
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user with their own family (user becomes ADMIN of their family)
    const user = await database.createUserWithFamily({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      avatar: '👤',
      role: 'ADMIN' // First user in a family is always admin
    }, hashedPassword, `${name}'s Family`)

    // Generate token
    const token = this.generateToken(user.id, user.email, user.familyId)
    const expiresAt = this.getTokenExpiration()

    // Convert to AuthUser
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: false, // In real app, would send verification email
      createdAt: user.createdAt
    }

    return {
      user: authUser,
      token,
      expiresAt
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    // Find user
    const user = await database.getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      throw createError('Invalid email or password', 401)
    }

    // Check password
    const storedPassword = await database.getUserPassword(user.id)
    if (!storedPassword) {
      throw createError('Invalid email or password', 401)
    }

    const isValidPassword = await bcrypt.compare(password, storedPassword)
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401)
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.familyId)
    const expiresAt = this.getTokenExpiration()

    // Convert to AuthUser
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: true, // Assume verified for demo
      createdAt: user.createdAt
    }

    return {
      user: authUser,
      token,
      expiresAt
    }
  }

  async refreshToken(oldToken: string): Promise<{ token: string; expiresAt: Date }> {
    try {
      const decoded = jwt.verify(oldToken, this.jwtSecret) as JWTPayload

      // Verify user still exists
      const user = await database.getUserById(decoded.userId)
      if (!user) {
        throw createError('User not found', 401)
      }

      const token = this.generateToken(user.id, user.email, user.familyId)
      const expiresAt = this.getTokenExpiration()

      return { token, expiresAt }
    } catch (error) {
      throw createError('Invalid refresh token', 401)
    }
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload

      // Verify user still exists
      const user = await database.getUserById(decoded.userId)
      if (!user) {
        throw createError('User not found', 401)
      }

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createError('Token expired', 401)
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw createError('Invalid token', 401)
      } else {
        throw error
      }
    }
  }

  private generateToken(userId: string, email: string, familyId: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      familyId
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    } as jwt.SignOptions)
  }

  private getTokenExpiration(): Date {
    // Parse the expiresIn string (e.g., '24h', '7d')
    const expiresIn = this.jwtExpiresIn
    let milliseconds = 24 * 60 * 60 * 1000 // Default: 24 hours

    if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1))
      milliseconds = hours * 60 * 60 * 1000
    } else if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1))
      milliseconds = days * 24 * 60 * 60 * 1000
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.slice(0, -1))
      milliseconds = minutes * 60 * 1000
    }

    return new Date(Date.now() + milliseconds)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const authService = new AuthService()