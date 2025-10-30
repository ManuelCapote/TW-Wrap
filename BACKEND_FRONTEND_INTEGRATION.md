# Backend-Frontend Integration Documentation

**Last Updated:** 2025-01-27
**Status:** ✅ FULLY INTEGRATED

---

## Overview

The TW Wrap application now has complete backend-frontend integration. All core features are connected to the PostgreSQL database via the Express.js REST API.

---

## Integration Status Summary

### ✅ Authentication System (100%)
- User registration
- User login
- JWT token management
- Session persistence
- Auto-login on app load

### ✅ Family Management (100%)
- View family information
- Manage family members
- Create/manage invite codes
- Join families
- Remove members
- Leave family
- Update family settings

### ✅ Wishlist System (100%)
- Create wishlist items
- View personal wishlist
- View family wishlists
- Update wishlist items
- Delete wishlist items
- Mark items as purchased
- Priority management

---

## Architecture

### Backend
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL 14
- **ORM:** Prisma
- **Authentication:** JWT tokens
- **Port:** 3000

### Frontend
- **Framework:** Vue 3 + TypeScript
- **State Management:** Pinia stores
- **UI:** Tailwind CSS + HeadlessUI
- **Port:** 5173

### API Base URL
```
http://localhost:3000/api
```

---

## Files Created/Modified

### New Backend Integration Files

1. **`TW-Web/src/services/wishlistApi.ts`**
   - Wishlist API service
   - All 7 wishlist endpoint wrappers
   - Date conversion utilities
   - Error handling

2. **`TW-Web/src/stores/wishlist.ts`**
   - Wishlist Pinia store
   - State management for user wishlist
   - State management for family wishlists
   - CRUD actions
   - Purchase status management

### Modified Frontend Files

3. **`TW-Web/src/views/MyWishlistView.vue`**
   - Removed mock data (lines 25-67)
   - Integrated wishlist store
   - Connected to real API
   - Real-time data persistence

4. **`TW-Web/src/views/FamilyView.vue`**
   - Removed mock data (lines 24-136)
   - Integrated family store
   - Integrated wishlist store
   - Real-time family wishlist viewing
   - Purchase tracking

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| GET | `/api/auth/verify` | Verify token | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user | Yes |
| PUT | `/api/users/me` | Update profile | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes (family) |

### Families (`/api/families`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/families/my` | Get user's family | Yes |
| GET | `/api/families/members` | Get family members | Yes |
| PUT | `/api/families/my` | Update family name | Yes (admin) |
| POST | `/api/families/invites` | Create invite | Yes (admin) |
| GET | `/api/families/invites` | Get active invites | Yes (admin) |
| DELETE | `/api/families/invites/:code` | Revoke invite | Yes (admin) |
| POST | `/api/families/join` | Join with code | Yes |
| DELETE | `/api/families/members/:userId` | Remove member | Yes (admin) |
| POST | `/api/families/leave` | Leave family | Yes |

### Wishlists (`/api/wishlists`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlists/my` | Get user's wishlist | Yes |
| GET | `/api/wishlists/family` | Get family wishlists | Yes |
| GET | `/api/wishlists/user/:userId` | Get specific user's wishlist | Yes (family) |
| POST | `/api/wishlists` | Create wishlist item | Yes |
| PUT | `/api/wishlists/:id` | Update item | Yes (owner) |
| DELETE | `/api/wishlists/:id` | Delete item | Yes (owner) |
| PATCH | `/api/wishlists/:id/purchase` | Toggle purchase status | Yes (family) |

---

## Data Flow

### Example: Creating a Wishlist Item

```typescript
// 1. User fills out form in MyWishlistView.vue
const addItem = async (itemData) => {
  // 2. Call wishlist store action
  await wishlistStore.createItem({
    title: itemData.title,
    description: itemData.description,
    url: itemData.url,
    price: itemData.price,
    currency: itemData.currency,
    store: itemData.store,
    quantity: itemData.quantity,
    priority: itemData.priority
  })
}

// 3. Store calls API service
// wishlist.ts store
const createItem = async (item) => {
  const newItem = await wishlistApi.createItem(item)
  myWishlist.value.push(newItem)
}

// 4. API service makes HTTP request
// wishlistApi.ts
async createItem(item) {
  const response = await fetch(`${BASE_URL}/wishlists`, {
    method: 'POST',
    headers: getAuthHeaders(), // Includes JWT token
    body: JSON.stringify(item)
  })
  return handleResponse(response)
}

// 5. Backend processes request
// - Validates JWT token
// - Validates input data
// - Creates database record via Prisma
// - Returns created item

// 6. Frontend updates
// - API service receives response
// - Converts date strings to Date objects
// - Store updates state
// - UI reactively updates
```

---

## State Management

### Pinia Stores

#### Auth Store (`stores/auth.ts`)
```typescript
State:
- user: User | null
- token: string | null
- isLoading: boolean
- error: string | null

Getters:
- isAuthenticated: boolean
- userName: string
- userRole: UserRole

Actions:
- login(email, password)
- register(userData)
- logout()
- refreshToken()
- initialize()
```

#### Family Store (`stores/family.ts`)
```typescript
State:
- family: Family | null
- members: User[]
- invites: FamilyInvite[]
- isLoading: boolean
- error: string | null

Getters:
- isAdmin: boolean
- familyName: string
- adminMembers: User[]
- regularMembers: User[]

Actions:
- fetchFamily()
- fetchFamilyMembers()
- updateFamilyName(name)
- createInviteCode(config)
- loadInvites()
- revokeInvite(code)
- joinWithCode(code)
- removeMember(userId)
- leaveFamily()
```

#### Wishlist Store (`stores/wishlist.ts`)
```typescript
State:
- myWishlist: WishListItem[]
- familyWishlists: FamilyWishlistsResponse[]
- isLoading: boolean
- error: string | null

Getters:
- totalItems: number
- purchasedItems: number
- pendingItems: number
- highPriorityItems: number
- completionPercentage: number
- hasItems: boolean
- getWishlistByUserId(userId)
- getItemsByUserId(userId)

Actions:
- fetchMyWishlist()
- fetchFamilyWishlists()
- fetchUserWishlist(userId)
- createItem(item)
- updateItem(id, updates)
- deleteItem(id)
- togglePurchaseStatus(id, isPurchased, userId)
- markAsPurchased(id, userId)
- markAsUnpurchased(id, userId)
```

---

## Authentication Flow

### 1. Token Storage
```typescript
// Tokens stored in localStorage
localStorage.setItem('tw-web-auth-token', token)
localStorage.setItem('tw-web-user', JSON.stringify(user))
```

### 2. Request Headers
```typescript
// All authenticated requests include:
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

### 3. Auto-Login
```typescript
// On app load (main.ts)
const authStore = useAuthStore()
await authStore.initialize() // Validates stored token
```

### 4. Token Expiration
- Tokens expire after 24 hours
- Frontend automatically redirects to login on 401 errors
- Refresh token endpoint available for extended sessions

---

## Error Handling

### API Service Layer
```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || data.message || 'Request failed')
  }

  return data.data
}
```

### Store Layer
```typescript
try {
  isLoading.value = true
  error.value = null
  const result = await apiService.someMethod()
  // Update state
} catch (err) {
  error.value = err instanceof Error ? err.message : 'Failed'
  console.error('Error:', err)
  throw err
} finally {
  isLoading.value = false
}
```

### View Layer
```typescript
try {
  await wishlistStore.createItem(itemData)
  showAddForm.value = false
} catch (error) {
  console.error('Failed to add item:', error)
  // Error message available in store.error
}
```

---

## Testing the Integration

### 1. Start Backend
```bash
cd TW-Backend
npm run dev
# Server running on http://localhost:3000
```

### 2. Start Frontend
```bash
cd TW-Web
npm run dev
# App running on http://localhost:5173
```

### 3. Test Authentication
1. Navigate to http://localhost:5173
2. Register a new account
3. Login with credentials
4. Verify token in localStorage
5. Check Network tab for API calls

### 4. Test Family Management
1. View family info on Dashboard
2. Go to Settings page
3. Create invite code (if admin)
4. Copy and use invite code to join
5. View family members list
6. Remove a member (if admin)

### 5. Test Wishlists
1. Go to "My Wishlist" page
2. Click "Add item"
3. Fill out form and save
4. Verify item appears in list
5. Edit an item
6. Delete an item
7. Go to "Family" page
8. View other members' wishlists
9. Mark an item as purchased
10. Verify purchase status updates

---

## Database Schema

### Key Tables

**User**
- id, name, email, password (hashed)
- avatar, role (ADMIN/MEMBER)
- familyId (foreign key)
- createdAt, updatedAt

**Family**
- id, name, ownerId
- createdAt

**WishListItem**
- id, userId (foreign key)
- title, description, url, imageUrl
- price, currency, store, quantity
- isPurchased, purchasedBy, purchasedAt
- priority (low/medium/high)
- createdAt, updatedAt

**FamilyInvite**
- id, code, familyId
- createdById, expiresAt
- maxUses, currentUses, isActive
- createdAt

---

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tw-web-super-secret-dev-key-2024
JWT_EXPIRES_IN=24h
DATABASE_URL=postgresql://alexkpot@localhost:5432/tw_wrap_dev
FRONTEND_URL=http://localhost:5174
BCRYPT_ROUNDS=12
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Performance Considerations

### Data Caching
- Stores cache API responses
- Use computed properties for derived state
- Avoid redundant API calls

### Loading States
- All stores have `isLoading` state
- Views show loading skeletons during fetch
- Prevents multiple simultaneous requests

### Optimistic Updates
```typescript
// Example: Mark as purchased
const markAsPurchased = async (id, userId) => {
  // Could implement optimistic update here:
  // 1. Update UI immediately
  // 2. Make API call
  // 3. Revert if API call fails
  await wishlistStore.markAsPurchased(id, userId)
}
```

---

## Security

### Authentication
- JWT tokens with 24h expiration
- Bcrypt password hashing (12 rounds)
- Tokens stored in localStorage (consider httpOnly cookies for production)

### Authorization
- Role-based access control (ADMIN/MEMBER)
- Family-scoped data access
- Owner-only item modifications

### CORS
- Configured for localhost:5173/5174
- Update for production domains

### Input Validation
- Backend validates all inputs
- Frontend validates forms
- Prisma schema enforces constraints

---

## Troubleshooting

### "Can't reach database server"
```bash
# Start PostgreSQL
brew services start postgresql@14

# Check status
brew services list | grep postgres

# Test connection
psql -h localhost -p 5432 -U alexkpot -d tw_wrap_dev
```

### "401 Unauthorized"
- Check token in localStorage
- Token may have expired (24h)
- Re-login to get new token

### "Network request failed"
- Ensure backend is running on port 3000
- Check CORS configuration
- Verify API_BASE_URL in frontend

### "Items not showing"
- Check Network tab for API responses
- Verify store state in Vue DevTools
- Check console for errors
- Ensure data is loaded in onMounted

---

## Next Steps / Future Enhancements

### Immediate (Optional)
1. Add user profile editing UI
2. Add avatar upload functionality
3. Add real-time updates (WebSockets)
4. Add optimistic UI updates

### Medium Term
1. Add image upload for wishlist items
2. Add URL preview/scraping
3. Add email notifications
4. Add password reset flow

### Long Term
1. Add mobile app (React Native)
2. Add push notifications
3. Add social sharing
4. Add gift suggestions (AI)

---

## Support & Resources

### Documentation
- Backend API: See `TW-Backend/README.md`
- Frontend: See `TW-Web/README.md`
- Database: See `TW-Backend/DATABASE_INTEGRATION_COMPLETE.md`

### Code Locations
- API Services: `TW-Web/src/services/`
- Pinia Stores: `TW-Web/src/stores/`
- Views: `TW-Web/src/views/`
- Backend Routes: `TW-Backend/src/routes/`
- Backend Services: `TW-Backend/src/services/`

### Common Commands
```bash
# Backend
cd TW-Backend
npm run dev              # Start dev server
npm run build            # Build for production
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run migrations

# Frontend
cd TW-Web
npm run dev              # Start dev server
npm run build            # Build for production
npm run type-check       # Check TypeScript

# Database
brew services start postgresql@14
psql -d tw_wrap_dev
```

---

**Integration Complete!** 🎉

All core features are now connected to the backend. Users can register, login, manage families, create wishlists, and track gifts - all with full database persistence.
