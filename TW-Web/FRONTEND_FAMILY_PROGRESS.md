# Frontend Family Management Implementation - In Progress

## ✅ Completed (Foundation Layer)

### 1. Type Definitions Updated
**File**: `src/types/index.ts`

Added:
- ✅ `UserRole` type ('ADMIN' | 'MEMBER')
- ✅ Added `role: UserRole` to `User` interface
- ✅ Added `role: UserRole` to `AuthUser` interface
- ✅ Added `ownerId: string` to `Family` interface
- ✅ Created `FamilyInvite` interface
- ✅ Created `CreateInviteRequest` interface
- ✅ Created `JoinFamilyRequest` interface

**Result**: Frontend types now match backend exactly ✅

### 2. Family API Service Created
**File**: `src/services/familyApi.ts`

Implemented methods:
- ✅ `getFamily()` - GET /api/families/my
- ✅ `getFamilyMembers()` - GET /api/families/members
- ✅ `updateFamilyName(name)` - PUT /api/families/my
- ✅ `createInvite(config)` - POST /api/families/invites
- ✅ `getActiveInvites()` - GET /api/families/invites
- ✅ `revokeInvite(code)` - DELETE /api/families/invites/:code
- ✅ `joinFamily(request)` - POST /api/families/join
- ✅ `removeMember(userId)` - DELETE /api/families/members/:userId
- ✅ `leaveFamily()` - POST /api/families/leave

Features:
- Auto token extraction from localStorage
- Response error handling
- Date string to Date object conversion
- TypeScript type safety

**Result**: Complete API integration layer ready ✅

### 3. Family Pinia Store Created
**File**: `src/stores/family.ts`

**State**:
- ✅ `family` - Current family data
- ✅ `members` - Array of family members
- ✅ `invites` - Array of active invites
- ✅ `isLoading` - Loading state
- ✅ `error` - Error message

**Getters**:
- ✅ `isAdmin` - Check if current user is admin
- ✅ `familyName` - Get family name
- ✅ `adminMembers` - Filter admin members
- ✅ `regularMembers` - Filter regular members
- ✅ `currentUserId` - Get current user ID

**Actions**:
- ✅ `fetchFamily()` - Load family data
- ✅ `fetchFamilyMembers()` - Load members
- ✅ `updateFamilyName(name)` - Update family name
- ✅ `createInviteCode(config)` - Generate invite
- ✅ `loadInvites()` - Fetch active invites
- ✅ `revokeInvite(code)` - Revoke invite
- ✅ `joinWithCode(request)` - Join family
- ✅ `removeMember(userId)` - Remove member
- ✅ `leaveFamily()` - Leave family
- ✅ `clearError()` - Clear error state
- ✅ `reset()` - Reset all state

Features:
- Permission checks (admin-only actions)
- Auth store integration
- Local state updates after API calls
- Error handling
- Auto-refresh after state changes

**Result**: Complete state management ready ✅

### 4. RoleBadge Component Created
**File**: `src/components/family/RoleBadge.vue`

Features:
- ✅ Props: `role` (ADMIN/MEMBER), `size` (small/medium)
- ✅ Color-coded styling (gold for admin, gray for member)
- ✅ Icons (crown for admin, user for member)
- ✅ Dark mode support
- ✅ Responsive sizing

**Result**: Reusable role display component ready ✅

---

## 🚧 Remaining Work

### Components to Build (5 files)
1. **InviteCodeManager.vue** - Admin panel for managing invites
2. **MemberManagement.vue** - List and manage family members
3. **JoinFamilyModal.vue** - Modal for joining with invite code
4. **LeaveFamilyModal.vue** - Confirmation modal for leaving
5. **FamilyInfoCard.vue** - Display and edit family info

### Views to Create/Update (2 files)
1. **SettingsView.vue** - New settings page
2. **FamilyView.vue** - Update to use real API data (remove mocks)

### Routing & Navigation (2 files)
1. **router/index.ts** - Add settings routes
2. **App.vue** - Add settings link to nav

### Optional Enhancements (1 file)
1. **RegisterForm.vue** - Add invite code field to registration

---

## Quick Implementation Guide

### Next Steps Priority:

**PHASE 1 - Core UI** (Highest Priority):
1. Build InviteCodeManager component
2. Build MemberManagement component
3. Create SettingsView
4. Add routes for settings

**PHASE 2 - Integration**:
1. Update FamilyView to use real data
2. Add settings link to App.vue navigation

**PHASE 3 - Modals**:
1. Build JoinFamilyModal
2. Build LeaveFamilyModal
3. Add to registration flow

---

## Component Templates

### InviteCodeManager.vue Structure
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'

const familyStore = useFamilyStore()
const expiresInDays = ref(7)
const maxUses = ref(10)
const showNewCodeModal = ref(false)
const newlyCreatedCode = ref('')

const handleCreateInvite = async () => {
  const invite = await familyStore.createInviteCode({
    expiresInDays: expiresInDays.value,
    maxUses: maxUses.value
  })
  newlyCreatedCode.value = invite.code
  showNewCodeModal.value = true
}

const handleRevokeInvite = async (code: string) => {
  if (confirm('Are you sure you want to revoke this invite code?')) {
    await familyStore.revokeInvite(code)
  }
}

const copyToClipboard = (code: string) => {
  navigator.clipboard.writeText(code)
  // Show success toast
}

onMounted(() => {
  familyStore.loadInvites()
})
</script>

<template>
  <!-- Create invite form -->
  <!-- Active invites table -->
  <!-- Revoke buttons -->
  <!-- Copy buttons -->
</template>
```

### MemberManagement.vue Structure
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import RoleBadge from './RoleBadge.vue'

const familyStore = useFamilyStore()

const handleRemoveMember = async (userId: string, memberName: string) => {
  if (confirm(`Remove ${memberName} from the family?`)) {
    await familyStore.removeMember(userId)
  }
}

onMounted(() => {
  familyStore.fetchFamilyMembers()
})
</script>

<template>
  <!-- Member cards with avatar, name, email -->
  <!-- Role badge for each member -->
  <!-- Remove button (admin only, not for admins/self) -->
</template>
```

### Settings View Structure
```vue
<script setup lang="ts">
import { useFamilyStore } from '@/stores/family'
import MemberManagement from '@/components/family/MemberManagement.vue'
import InviteCodeManager from '@/components/family/InviteCodeManager.vue'
import FamilyInfoCard from '@/components/family/FamilyInfoCard.vue'

const familyStore = useFamilyStore()
</script>

<template>
  <div class="settings-view">
    <h1>Family Settings</h1>

    <FamilyInfoCard v-if="familyStore.isAdmin" />

    <section>
      <h2>Family Members</h2>
      <MemberManagement />
    </section>

    <section v-if="familyStore.isAdmin">
      <h2>Invite Codes</h2>
      <InviteCodeManager />
    </section>
  </div>
</template>
```

### Router Update
```typescript
// Add to routes array in src/router/index.ts
{
  path: '/settings',
  name: 'settings',
  component: () => import('../views/SettingsView.vue'),
  meta: {
    requiresAuth: true,
    title: 'Settings - TW-Web'
  }
}
```

### App.vue Navigation Update
```vue
<!-- Add to nav section -->
<RouterLink to="/settings" class="nav-link">Settings</RouterLink>
```

---

## Testing Checklist

Once implementation is complete:

**Admin Flow**:
- [ ] Login as admin (demo@family.com)
- [ ] Navigate to Settings
- [ ] Create invite code
- [ ] Copy invite code
- [ ] View active invites list
- [ ] Update family name
- [ ] View family members with roles
- [ ] Remove a member (not admin)
- [ ] Revoke an invite code

**Member Flow**:
- [ ] Register new user or login as mom@family.com
- [ ] Use invite code to join family
- [ ] View family members (no admin controls)
- [ ] Cannot access invite management
- [ ] Cannot update family name
- [ ] Can leave family

**UI Checks**:
- [ ] Role badges display correctly
- [ ] Admin-only buttons hidden for members
- [ ] Loading states show during API calls
- [ ] Error messages display properly
- [ ] Success messages/toasts work
- [ ] Dark mode styling correct

---

## Current Architecture Summary

```
Frontend (Vue 3 + TypeScript + Pinia)
│
├── Types Layer ✅
│   └── Complete type definitions matching backend
│
├── API Layer ✅
│   └── Family API service with all endpoints
│
├── State Layer ✅
│   └── Family Pinia store with full CRUD operations
│
├── Component Layer 🚧
│   ├── RoleBadge.vue ✅
│   ├── InviteCodeManager.vue ❌
│   ├── MemberManagement.vue ❌
│   ├── JoinFamilyModal.vue ❌
│   ├── LeaveFamilyModal.vue ❌
│   └── FamilyInfoCard.vue ❌
│
├── Views Layer 🚧
│   ├── SettingsView.vue ❌
│   └── FamilyView.vue (needs update) ❌
│
└── Routing Layer 🚧
    ├── Routes ❌
    └── Navigation ❌
```

---

## Backend API Endpoints (All Ready)

All these endpoints are implemented and tested:

✅ GET /api/families/my
✅ GET /api/families/members
✅ PUT /api/families/my
✅ POST /api/families/invites
✅ GET /api/families/invites
✅ DELETE /api/families/invites/:code
✅ POST /api/families/join
✅ DELETE /api/families/members/:userId
✅ POST /api/families/leave

---

## Files Created So Far

1. ✅ `/src/types/index.ts` - Updated with family types
2. ✅ `/src/services/familyApi.ts` - Complete API service
3. ✅ `/src/stores/family.ts` - Complete Pinia store
4. ✅ `/src/components/family/RoleBadge.vue` - Role badge component

**Progress**: 4/14 files complete (29%)
**Foundation**: 100% complete ✅
**UI Components**: 20% complete 🚧

---

## Estimated Remaining Time

- **Components** (5 files): ~2-3 hours
- **Views** (2 files): ~1 hour
- **Routing** (2 files): ~30 minutes
- **Testing & Polish**: ~1 hour

**Total**: ~4-5 hours of development time remaining

---

**Next Session**: Start with building the InviteCodeManager and MemberManagement components, then create the SettingsView.
