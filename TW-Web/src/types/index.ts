export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  familyId: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  isEmailVerified: boolean
  createdAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
  expiresAt: Date
}

export interface WishListItem {
  id: string
  userId: string
  title: string
  description?: string
  url: string
  price?: number
  currency?: string
  store?: string
  quantity: number
  isPurchased: boolean
  purchasedBy?: string
  purchasedAt?: Date
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface Family {
  id: string
  name: string
  members: User[]
  createdAt: Date
}

export interface ProductPreview {
  title: string
  description?: string
  price?: number
  currency?: string
  store?: string
}