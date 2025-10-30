import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { database } from './database'
import { emailService } from './email'
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

  /**
   * Request a password reset for the given email
   * Generates a secure token and sends reset email
   * @param email - User's email address
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email (but don't reveal if user exists for security)
    const user = await database.getUserByEmail(normalizedEmail)

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we pretend the email was sent
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${normalizedEmail}`)
      return // Silently succeed
    }

    // Generate secure reset token (64 characters)
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash the token before storing in database (extra security)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set expiration to 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

    // Store reset token in database
    await database.createPasswordResetToken(user.id, hashedToken, expiresAt)

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.name)

    console.log(`Password reset email sent to: ${user.email}`)
  }

  /**
   * Reset password using the provided token
   * @param token - Reset token from email
   * @param newPassword - New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw createError('Password must be at least 6 characters', 400)
    }

    // Hash the token to match what's stored in database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find and validate reset token
    const resetTokenRecord = await database.getPasswordResetToken(hashedToken)

    if (!resetTokenRecord) {
      throw createError('Invalid or expired reset token', 400)
    }

    // Check if token is expired
    if (new Date() > resetTokenRecord.expiresAt) {
      await database.deletePasswordResetToken(resetTokenRecord.id)
      throw createError('Reset token has expired. Please request a new one.', 400)
    }

    // Check if token has already been used
    if (resetTokenRecord.used) {
      throw createError('This reset token has already been used', 400)
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update user's password
    await database.updateUserPassword(resetTokenRecord.userId, hashedPassword)

    // Mark token as used (prevents reuse)
    await database.markPasswordResetTokenAsUsed(resetTokenRecord.id)

    // Get user info for confirmation email
    const user = await database.getUserById(resetTokenRecord.userId)

    // Send confirmation email (optional, won't throw on failure)
    if (user) {
      await emailService.sendPasswordResetConfirmation(user.email, user.name)
    }

    console.log(`Password reset successful for user: ${resetTokenRecord.userId}`)
  }

  /**
   * Validate if a reset token is valid and not expired
   * @param token - Reset token to validate
   * @returns boolean - true if valid
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
      const resetTokenRecord = await database.getPasswordResetToken(hashedToken)

      if (!resetTokenRecord) {
        return false
      }

      // Check expiration
      if (new Date() > resetTokenRecord.expiresAt) {
        return false
      }

      // Check if already used
      if (resetTokenRecord.used) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const authService = new AuthService()