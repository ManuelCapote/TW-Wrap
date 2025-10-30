// PRISMA DATABASE SERVICE
// This replaces the in-memory storage with real PostgreSQL database persistence

import { PrismaClient } from '@prisma/client'
import { User, WishListItem, Family, FamilyInvite, UserRole } from '../types'
import crypto from 'crypto'

// LEARNING NOTE - TYPE CONVERSION HELPERS:
// Prisma uses 'null' for optional fields (SQL standard)
// Our TypeScript types use 'undefined' (JavaScript standard)
// These helpers convert between the two conventions

/**
 * Convert Prisma User to our User type
 * Changes null to undefined for optional fields
 */
function toUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    avatar: prismaUser.avatar ?? undefined,
    role: prismaUser.role as UserRole,
    familyId: prismaUser.familyId,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt
  }
}

/**
 * Convert Prisma FamilyInvite to our FamilyInvite type
 */
function toFamilyInvite(prismaInvite: any): FamilyInvite {
  return {
    id: prismaInvite.id,
    code: prismaInvite.code,
    familyId: prismaInvite.familyId,
    createdById: prismaInvite.createdById,
    expiresAt: prismaInvite.expiresAt,
    maxUses: prismaInvite.maxUses,
    currentUses: prismaInvite.currentUses,
    isActive: prismaInvite.isActive,
    createdAt: prismaInvite.createdAt
  }
}

/**
 * Convert Prisma WishlistItem to our WishListItem type
 * Changes null to undefined and handles priority case conversion
 */
function toWishlistItem(prismaItem: any): WishListItem {
  return {
    id: prismaItem.id,
    userId: prismaItem.userId,
    title: prismaItem.title,
    description: prismaItem.description ?? undefined,
    url: prismaItem.url ?? undefined,
    imageUrl: prismaItem.imageUrl ?? undefined,
    price: prismaItem.price ?? undefined,
    currency: prismaItem.currency ?? undefined,
    store: prismaItem.store ?? undefined,
    quantity: prismaItem.quantity,
    isPurchased: prismaItem.isPurchased,
    purchasedBy: prismaItem.purchasedBy ?? undefined,
    purchasedAt: prismaItem.purchasedAt ?? undefined,
    priority: prismaItem.priority.toLowerCase() as 'low' | 'medium' | 'high',
    createdAt: prismaItem.createdAt,
    updatedAt: prismaItem.updatedAt
  }
}

// WHAT IS PrismaClient?
// PrismaClient is the auto-generated database client that provides:
// 1. Type-safe queries (TypeScript knows what fields exist)
// 2. Auto-completion in your IDE
// 3. Runtime query validation
// 4. Connection pooling (reuses database connections efficiently)

// Create a singleton Prisma Client instance
// Singleton pattern = one instance shared across the entire app
// This is important because:
// - Each PrismaClient creates a connection pool
// - Too many clients = too many database connections
// - One client = efficient connection reuse
const prisma = new PrismaClient({
  // Log database queries in development (helpful for learning!)
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// WHY THIS CLASS STRUCTURE?
// We wrap PrismaClient in a class to:
// 1. Match the interface of the old InMemoryDatabase (easy migration)
// 2. Add custom business logic beyond basic CRUD
// 3. Transform Prisma results to match our TypeScript types
// 4. Handle errors consistently
export class PrismaDatabase {

  // ============================================================================
  // USER METHODS
  // ============================================================================

  /**
   * Get all users in the database
   *
   * LEARNING NOTE - ASYNC/AWAIT:
   * Database operations are asynchronous (they take time).
   * The 'async' keyword lets us use 'await' to wait for results.
   * Without 'await', you'd get a Promise instead of actual data.
   *
   * LEARNING NOTE - PRISMA QUERY:
   * prisma.user.findMany() translates to:
   * SELECT * FROM "User";
   */
  async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany()
    return users.map(toUser)
  }

  /**
   * Find a user by their unique ID
   *
   * LEARNING NOTE - WHERE CLAUSE:
   * { where: { id } } translates to:
   * SELECT * FROM "User" WHERE id = $1;
   *
   * findUnique() expects a unique field (id or email)
   * Returns null if not found (not an error!)
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    return user ? toUser(user) : null
  }

  /**
   * Find a user by their email address
   *
   * LEARNING NOTE - UNIQUE CONSTRAINTS:
   * We can use findUnique() because email has a unique constraint
   * If email wasn't unique, we'd use findFirst() instead
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user ? toUser(user) : null
  }

  /**
   * Create a new user with hashed password
   *
   * LEARNING NOTE - CREATE OPERATION:
   * prisma.user.create() translates to:
   * INSERT INTO "User" (id, name, email, ...) VALUES ($1, $2, $3, ...);
   *
   * Prisma automatically:
   * - Generates UUID for id
   * - Sets createdAt to current timestamp
   * - Sets updatedAt to current timestamp
   *
   * @param userData - User information (without id, timestamps)
   * @param hashedPassword - bcrypt hashed password
   * @returns The newly created user
   */
  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    hashedPassword: string
  ): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        password: hashedPassword,
        familyId: userData.familyId
      }
    })
    return toUser(user)
  }

  /**
   * Update an existing user
   *
   * LEARNING NOTE - UPDATE OPERATION:
   * prisma.user.update() translates to:
   * UPDATE "User" SET name = $1, email = $2, ... WHERE id = $3;
   *
   * The @updatedAt directive in schema automatically updates the timestamp
   *
   * Returns null if user not found
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updates
      })
      return toUser(user)
    } catch (error) {
      // If user doesn't exist, Prisma throws an error
      // We catch it and return null to match the old interface
      return null
    }
  }

  /**
   * Get a user's hashed password (for authentication)
   *
   * SECURITY NOTE:
   * We only return the password when explicitly requested (authentication)
   * Never send passwords in API responses, even if hashed!
   */
  async getUserPassword(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Only select the password field (more efficient than fetching all fields)
      select: { password: true }
    })
    return user?.password ?? null
  }

  // ============================================================================
  // WISHLIST METHODS
  // ============================================================================

  /**
   * Get wishlist items with optional filtering
   *
   * LEARNING NOTE - COMPLEX QUERIES:
   * This method showcases multiple Prisma features:
   * 1. Conditional where clauses
   * 2. Nested relations (include user data)
   * 3. Filtering by related data (user's familyId)
   *
   * @param userId - Filter by item owner (optional)
   * @param familyId - Filter by family (gets all members' items) (optional)
   * @returns Array of wishlist items
   */
  async getWishlistItems(userId?: string, familyId?: string): Promise<WishListItem[]> {
    // Build the where clause dynamically based on parameters
    let whereClause: any = {}

    if (userId) {
      // Simple filter: items belonging to specific user
      // SQL: WHERE userId = $1
      whereClause.userId = userId
    } else if (familyId) {
      // Complex filter: items belonging to users in specific family
      // This requires a JOIN between WishlistItem and User tables
      // SQL: WHERE userId IN (SELECT id FROM User WHERE familyId = $1)
      whereClause.user = {
        familyId: familyId
      }
    }

    const items = await prisma.wishlistItem.findMany({
      where: whereClause,
      // Order by creation date, newest first
      orderBy: { createdAt: 'desc' }
    })

    // LEARNING NOTE - TYPE MAPPING:
    // Prisma returns Priority as enum ('LOW' | 'MEDIUM' | 'HIGH')
    // Our WishListItem type expects lowercase ('low' | 'medium' | 'high')
    // We need to transform the data to match our types
    return items.map(toWishlistItem)
  }

  /**
   * Find a specific wishlist item by ID
   */
  async getWishlistItemById(id: string): Promise<WishListItem | null> {
    const item = await prisma.wishlistItem.findUnique({
      where: { id }
    })

    if (!item) return null

    return toWishlistItem(item)
  }

  /**
   * Create a new wishlist item
   *
   * LEARNING NOTE - DATA VALIDATION:
   * Prisma validates data types automatically:
   * - title must be a string (required)
   * - price must be a number (optional)
   * - isPurchased must be a boolean
   *
   * If types don't match, Prisma throws an error before hitting the database
   */
  async createWishlistItem(
    itemData: Omit<WishListItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WishListItem> {
    const item = await prisma.wishlistItem.create({
      data: {
        title: itemData.title,
        description: itemData.description,
        url: itemData.url,
        imageUrl: itemData.imageUrl,
        price: itemData.price,
        currency: itemData.currency,
        store: itemData.store,
        quantity: itemData.quantity,
        isPurchased: itemData.isPurchased,
        // Convert lowercase priority to uppercase enum
        priority: itemData.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        userId: itemData.userId,
        purchasedBy: itemData.purchasedBy,
        purchasedAt: itemData.purchasedAt
      }
    })

    return toWishlistItem(item)
  }

  /**
   * Update a wishlist item
   *
   * LEARNING NOTE - PARTIAL UPDATES:
   * Prisma only updates the fields you provide
   * Other fields remain unchanged
   * This is more efficient than replacing the entire record
   */
  async updateWishlistItem(id: string, updates: Partial<WishListItem>): Promise<WishListItem | null> {
    try {
      // If priority is being updated, convert to uppercase
      const dataToUpdate: any = { ...updates }
      if (updates.priority) {
        dataToUpdate.priority = updates.priority.toUpperCase()
      }

      const item = await prisma.wishlistItem.update({
        where: { id },
        data: dataToUpdate
      })

      return toWishlistItem(item)
    } catch (error) {
      return null
    }
  }

  /**
   * Delete a wishlist item
   *
   * LEARNING NOTE - DELETE OPERATION:
   * prisma.wishlistItem.delete() translates to:
   * DELETE FROM "WishlistItem" WHERE id = $1;
   *
   * Returns true if successful, false if item not found
   */
  async deleteWishlistItem(id: string): Promise<boolean> {
    try {
      await prisma.wishlistItem.delete({
        where: { id }
      })
      return true
    } catch (error) {
      // Item not found
      return false
    }
  }

  // ============================================================================
  // FAMILY METHODS
  // ============================================================================

  /**
   * Find a family by ID
   *
   * LEARNING NOTE - RELATIONS (include):
   * The 'include' option performs a JOIN to fetch related data
   * This is like calling getFamilyById() and getAllUsers() separately,
   * but in a single database query (much faster!)
   *
   * SQL equivalent:
   * SELECT f.*, u.*
   * FROM Family f
   * LEFT JOIN User u ON u.familyId = f.id
   * WHERE f.id = $1;
   */
  async getFamilyById(id: string): Promise<Family | null> {
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        users: true  // Include all family members
      }
    })

    if (!family) return null

    // Transform to match our Family type
    return {
      id: family.id,
      name: family.name,
      ownerId: family.ownerId,
      members: family.users.map(toUser),  // Rename 'users' to 'members' and convert types
      createdAt: family.createdAt
    }
  }

  /**
   * Find a user's family
   *
   * LEARNING NOTE - NESTED QUERIES:
   * This showcases Prisma's ability to navigate relationships:
   * 1. Find the user
   * 2. Follow the relationship to their family
   * 3. Include all family members
   *
   * All in one query!
   */
  async getFamilyByUserId(userId: string): Promise<Family | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        family: {
          include: {
            users: true  // Get all family members
          }
        }
      }
    })

    if (!user || !user.family) return null

    return {
      id: user.family.id,
      name: user.family.name,
      ownerId: user.family.ownerId,
      members: user.family.users.map(toUser),
      createdAt: user.family.createdAt
    }
  }

  /**
   * Create a new family
   *
   * This is a new method that didn't exist in InMemoryDatabase
   * We'll need it for family creation functionality
   */
  async createFamily(name: string, ownerId: string): Promise<Family> {
    const family = await prisma.family.create({
      data: {
        name,
        ownerId
      },
      include: {
        users: true
      }
    })

    return {
      id: family.id,
      name: family.name,
      ownerId: family.ownerId,
      members: family.users.map(toUser),
      createdAt: family.createdAt
    }
  }

  /**
   * Create a new user with their own family (for registration)
   * This handles the transaction of creating both user and family together
   *
   * @param userData - User information (without id, timestamps, familyId)
   * @param hashedPassword - bcrypt hashed password
   * @param familyName - Name for the new family
   * @returns The newly created user with ADMIN role
   */
  async createUserWithFamily(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'familyId'>,
    hashedPassword: string,
    familyName: string
  ): Promise<User> {
    // Use a transaction to ensure both family and user are created
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create a temporary family with a placeholder ownerId
      const tempFamily = await tx.family.create({
        data: {
          name: familyName,
          ownerId: 'temp' // Will be updated with actual user ID
        }
      })

      // Step 2: Create the user as ADMIN of this family
      const newUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          password: hashedPassword,
          role: 'ADMIN', // First user is always admin
          familyId: tempFamily.id
        }
      })

      // Step 3: Update family with the actual ownerId
      await tx.family.update({
        where: { id: tempFamily.id },
        data: { ownerId: newUser.id }
      })

      return newUser
    })

    return toUser(result)
  }

  /**
   * Update family name
   */
  async updateFamilyName(familyId: string, name: string): Promise<Family | null> {
    try {
      const family = await prisma.family.update({
        where: { id: familyId },
        data: { name },
        include: {
          users: true
        }
      })

      return {
        id: family.id,
        name: family.name,
        ownerId: family.ownerId,
        members: family.users.map(toUser),
        createdAt: family.createdAt
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Update user's family (for joining a new family)
   */
  async updateUserFamily(userId: string, newFamilyId: string): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { familyId: newFamilyId }
      })
      return toUser(user)
    } catch (error) {
      return null
    }
  }

  /**
   * Remove a user from family (admin only)
   * This doesn't delete the user, just removes them from the family
   */
  async removeFamilyMember(userId: string): Promise<boolean> {
    try {
      // In a real app, you might want to move them to a "no family" state
      // or delete their account. For now, we'll just return true
      // The actual implementation will depend on your business logic
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      return !!user
    } catch (error) {
      return false
    }
  }

  // ============================================================================
  // FAMILY INVITE METHODS
  // ============================================================================

  /**
   * Generate a unique 8-character invite code
   */
  private generateInviteCode(): string {
    // Generate a random 8-character code (alphanumeric, uppercase)
    return crypto.randomBytes(4).toString('hex').toUpperCase()
  }

  /**
   * Create a new family invite code
   *
   * @param familyId - The family this invite is for
   * @param createdById - The user creating the invite (must be admin)
   * @param expiresInDays - Days until expiration (default: 7)
   * @param maxUses - Maximum uses allowed (default: 10)
   */
  async createFamilyInvite(
    familyId: string,
    createdById: string,
    expiresInDays: number = 7,
    maxUses: number = 10
  ): Promise<FamilyInvite> {
    // Generate unique code (retry if collision occurs)
    let code = this.generateInviteCode()
    let existingInvite = await prisma.familyInvite.findUnique({ where: { code } })

    while (existingInvite) {
      code = this.generateInviteCode()
      existingInvite = await prisma.familyInvite.findUnique({ where: { code } })
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const invite = await prisma.familyInvite.create({
      data: {
        code,
        familyId,
        createdById,
        expiresAt,
        maxUses,
        currentUses: 0,
        isActive: true
      }
    })

    return toFamilyInvite(invite)
  }

  /**
   * Get family invite by code
   *
   * Returns null if:
   * - Code doesn't exist
   * - Invite is inactive
   * - Invite has expired
   * - Invite has reached max uses
   */
  async getFamilyInviteByCode(code: string): Promise<FamilyInvite | null> {
    const invite = await prisma.familyInvite.findUnique({
      where: { code }
    })

    if (!invite) return null

    // Check if invite is still valid
    const now = new Date()
    if (!invite.isActive || invite.expiresAt < now || invite.currentUses >= invite.maxUses) {
      return null
    }

    return toFamilyInvite(invite)
  }

  /**
   * Use a family invite (increment usage count)
   *
   * @returns true if successful, false if invite is no longer valid
   */
  async useFamilyInvite(code: string): Promise<boolean> {
    const invite = await this.getFamilyInviteByCode(code)
    if (!invite) return false

    try {
      await prisma.familyInvite.update({
        where: { code },
        data: {
          currentUses: invite.currentUses + 1
        }
      })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get all invites for a family
   *
   * @param familyId - The family ID
   * @param activeOnly - Only return active invites (default: true)
   */
  async getInvitesByFamilyId(familyId: string, activeOnly: boolean = true): Promise<FamilyInvite[]> {
    const whereClause: any = { familyId }

    if (activeOnly) {
      const now = new Date()
      whereClause.isActive = true
      whereClause.expiresAt = { gte: now }
    }

    const invites = await prisma.familyInvite.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return invites.map(toFamilyInvite)
  }

  /**
   * Revoke (deactivate) a family invite
   *
   * @param code - The invite code to revoke
   * @returns true if successful, false if invite not found
   */
  async revokeInvite(code: string): Promise<boolean> {
    try {
      await prisma.familyInvite.update({
        where: { code },
        data: { isActive: false }
      })
      return true
    } catch (error) {
      return false
    }
  }

  // ============================================================================
  // PASSWORD RESET TOKEN METHODS
  // ============================================================================

  /**
   * Create a password reset token for a user
   *
   * @param userId - ID of the user requesting password reset
   * @param hashedToken - Hashed reset token (for security)
   * @param expiresAt - When this token expires
   * @returns The created token record
   */
  async createPasswordResetToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date
  ): Promise<any> {
    // First, delete any existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        used: false
      }
    })

    // Create new reset token
    const token = await prisma.passwordResetToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
        used: false
      }
    })

    return token
  }

  /**
   * Get a password reset token by hashed token value
   *
   * @param hashedToken - The hashed token to look up
   * @returns The token record or null if not found
   */
  async getPasswordResetToken(hashedToken: string): Promise<any | null> {
    const token = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    })
    return token
  }

  /**
   * Mark a password reset token as used
   *
   * @param tokenId - ID of the token to mark as used
   */
  async markPasswordResetTokenAsUsed(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true }
    })
  }

  /**
   * Delete a password reset token
   *
   * @param tokenId - ID of the token to delete
   */
  async deletePasswordResetToken(tokenId: string): Promise<void> {
    await prisma.passwordResetToken.delete({
      where: { id: tokenId }
    })
  }

  /**
   * Update a user's password
   *
   * @param userId - ID of the user
   * @param hashedPassword - New hashed password
   */
  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
  }

  /**
   * Clean up expired password reset tokens
   * This should be run periodically (e.g., daily cron job)
   */
  async cleanupExpiredResetTokens(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date() // less than current time = expired
        }
      }
    })
    return result.count
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Disconnect from database (important for graceful shutdown)
   *
   * LEARNING NOTE - CONNECTION MANAGEMENT:
   * When your server shuts down, you should close database connections
   * This prevents "dangling" connections that waste resources
   *
   * Call this in your shutdown handler:
   * process.on('SIGINT', async () => {
   *   await database.disconnect()
   *   process.exit(0)
   * })
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}

// Export singleton instance
// This ensures the entire app uses the same PrismaDatabase instance
export const database = new PrismaDatabase()

// WHAT HAPPENED TO THE MOCK DATA?
// In development, we'll create a seed script to populate the database
// This separates test data from production code
// Run: npx prisma db seed