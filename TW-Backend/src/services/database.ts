import { User, WishListItem, Family } from '../types'
import { v4 as uuidv4 } from 'uuid'

// In-memory database for development
// In production, this would be replaced with a real database

export class InMemoryDatabase {
  private users: User[] = []
  private passwords: { [userId: string]: string } = {}
  private wishlistItems: WishListItem[] = []
  private families: Family[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Create a default family
    const defaultFamily: Family = {
      id: 'family-1',
      name: 'Demo Family',
      members: [],
      createdAt: new Date()
    }
    this.families.push(defaultFamily)

    // Create demo users
    const demoUser: User = {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@family.com',
      avatar: '👨‍💻',
      familyId: 'family-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const momUser: User = {
      id: 'user-2',
      name: 'Mom',
      email: 'mom@family.com',
      avatar: '👩‍🦳',
      familyId: 'family-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const dadUser: User = {
      id: 'user-3',
      name: 'Dad',
      email: 'dad@family.com',
      avatar: '👨‍🦲',
      familyId: 'family-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.push(demoUser, momUser, dadUser)
    
    // Demo password: 'demo123' (properly hashed with bcrypt)
    const demoHashedPassword = '$2b$12$LOh/E2VjKis4pkNESKE7NOR1a.KzDOCylM5MnJDGYI/.mGnObylby'
    this.passwords['user-1'] = demoHashedPassword
    this.passwords['user-2'] = demoHashedPassword
    this.passwords['user-3'] = demoHashedPassword

    // Update family members
    defaultFamily.members = [demoUser, momUser, dadUser]

    // Create some demo wishlist items
    const demoItems: WishListItem[] = [
      {
        id: 'item-1',
        userId: 'user-1',
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Wireless noise-canceling headphones',
        url: 'https://amazon.com/sony-wh1000xm5',
        price: 349.99,
        currency: 'USD',
        store: 'Amazon',
        quantity: 1,
        isPurchased: false,
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-2',
        userId: 'user-1',
        title: 'Kindle Paperwhite',
        description: 'E-reader for reading books',
        url: 'https://amazon.com/kindle-paperwhite',
        price: 139.99,
        currency: 'USD',
        store: 'Amazon',
        quantity: 1,
        isPurchased: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-3',
        userId: 'user-2',
        title: 'Instant Pot Duo',
        description: '7-in-1 Electric Pressure Cooker',
        url: 'https://target.com/instant-pot-duo',
        price: 89.95,
        currency: 'USD',
        store: 'Target',
        quantity: 1,
        isPurchased: false,
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-4',
        userId: 'user-2',
        title: 'Yoga Mat',
        description: 'Non-slip exercise mat',
        url: 'https://rei.com/yoga-mat',
        price: 24.99,
        currency: 'USD',
        store: 'REI',
        quantity: 1,
        isPurchased: true,
        purchasedBy: 'user-3',
        purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-5',
        userId: 'user-3',
        title: 'Mechanical Keyboard',
        description: 'Cherry MX Blue switches',
        url: 'https://bestbuy.com/mechanical-keyboard',
        price: 129.99,
        currency: 'USD',
        store: 'Best Buy',
        quantity: 1,
        isPurchased: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'item-6',
        userId: 'user-3',
        title: 'Standing Desk Converter',
        description: 'Adjustable height desk riser',
        url: 'https://walmart.com/standing-desk',
        price: 199.00,
        currency: 'USD',
        store: 'Walmart',
        quantity: 1,
        isPurchased: false,
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    this.wishlistItems.push(...demoItems)
  }

  // User methods
  getAllUsers(): User[] {
    return [...this.users]
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id)
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email)
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, hashedPassword: string): User {
    const user: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.push(user)
    this.passwords[user.id] = hashedPassword

    // Add to family if it exists
    const family = this.families.find(f => f.id === user.familyId)
    if (family) {
      family.members.push(user)
    }

    return user
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) return undefined

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    }

    // Update in family as well
    const family = this.families.find(f => f.id === this.users[userIndex].familyId)
    if (family) {
      const memberIndex = family.members.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        family.members[memberIndex] = this.users[userIndex]
      }
    }

    return this.users[userIndex]
  }

  getUserPassword(userId: string): string | undefined {
    return this.passwords[userId]
  }

  // Wishlist methods
  getWishlistItems(userId?: string, familyId?: string): WishListItem[] {
    if (userId) {
      return this.wishlistItems.filter(item => item.userId === userId)
    }
    
    if (familyId) {
      const familyUserIds = this.users
        .filter(user => user.familyId === familyId)
        .map(user => user.id)
      return this.wishlistItems.filter(item => familyUserIds.includes(item.userId))
    }

    return [...this.wishlistItems]
  }

  getWishlistItemById(id: string): WishListItem | undefined {
    return this.wishlistItems.find(item => item.id === id)
  }

  createWishlistItem(itemData: Omit<WishListItem, 'id' | 'createdAt' | 'updatedAt'>): WishListItem {
    const item: WishListItem = {
      id: uuidv4(),
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.wishlistItems.push(item)
    return item
  }

  updateWishlistItem(id: string, updates: Partial<WishListItem>): WishListItem | undefined {
    const itemIndex = this.wishlistItems.findIndex(item => item.id === id)
    if (itemIndex === -1) return undefined

    this.wishlistItems[itemIndex] = {
      ...this.wishlistItems[itemIndex],
      ...updates,
      updatedAt: new Date()
    }

    return this.wishlistItems[itemIndex]
  }

  deleteWishlistItem(id: string): boolean {
    const itemIndex = this.wishlistItems.findIndex(item => item.id === id)
    if (itemIndex === -1) return false

    this.wishlistItems.splice(itemIndex, 1)
    return true
  }

  // Family methods
  getFamilyById(id: string): Family | undefined {
    return this.families.find(family => family.id === id)
  }

  getFamilyByUserId(userId: string): Family | undefined {
    const user = this.getUserById(userId)
    if (!user) return undefined
    return this.getFamilyById(user.familyId)
  }
}

// Export singleton instance
export const database = new InMemoryDatabase()