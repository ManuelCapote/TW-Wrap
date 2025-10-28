import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { familyApi } from '@/services/familyApi'
import type { User, Family, FamilyInvite, CreateInviteRequest, JoinFamilyRequest } from '@/types'

export const useFamilyStore = defineStore('family', () => {
  // State
  const family = ref<Family | null>(null)
  const members = ref<User[]>([])
  const invites = ref<FamilyInvite[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAdmin = computed(() => {
    const authStore = useAuthStore()
    return authStore.user?.role === 'ADMIN'
  })

  const familyName = computed(() => family.value?.name || '')

  const adminMembers = computed(() =>
    members.value.filter(m => m.role === 'ADMIN')
  )

  const regularMembers = computed(() =>
    members.value.filter(m => m.role === 'MEMBER')
  )

  const currentUserId = computed(() => {
    const authStore = useAuthStore()
    return authStore.user?.id || ''
  })

  // Actions
  const fetchFamilyMembers = async () => {
    try {
      isLoading.value = true
      error.value = null
      members.value = await familyApi.getFamilyMembers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load family members'
      console.error('Error fetching family members:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchFamily = async () => {
    try {
      isLoading.value = true
      error.value = null
      family.value = await familyApi.getFamily()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load family'
      console.error('Error fetching family:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateFamilyName = async (name: string) => {
    if (!isAdmin.value) {
      throw new Error('Only admins can update family name')
    }

    try {
      isLoading.value = true
      error.value = null
      family.value = await familyApi.updateFamilyName(name)
      return family.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update family name'
      console.error('Error updating family name:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createInviteCode = async (config?: CreateInviteRequest) => {
    if (!isAdmin.value) {
      throw new Error('Only admins can create invite codes')
    }

    try {
      isLoading.value = true
      error.value = null
      const invite = await familyApi.createInvite(config)
      invites.value.unshift(invite) // Add to beginning of list
      return invite
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create invite code'
      console.error('Error creating invite code:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadInvites = async () => {
    if (!isAdmin.value) {
      throw new Error('Only admins can view invite codes')
    }

    try {
      isLoading.value = true
      error.value = null
      invites.value = await familyApi.getActiveInvites()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load invites'
      console.error('Error loading invites:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const revokeInvite = async (code: string) => {
    if (!isAdmin.value) {
      throw new Error('Only admins can revoke invite codes')
    }

    try {
      isLoading.value = true
      error.value = null
      await familyApi.revokeInvite(code)
      // Remove from local state
      invites.value = invites.value.filter(inv => inv.code !== code)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to revoke invite'
      console.error('Error revoking invite:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const joinWithCode = async (request: JoinFamilyRequest) => {
    try {
      isLoading.value = true
      error.value = null
      const result = await familyApi.joinFamily(request)

      // Update local state
      family.value = result.family

      // Update auth store with new user data
      const authStore = useAuthStore()
      authStore.user = {
        ...authStore.user!,
        ...result.user
      }

      // Refresh family members
      await fetchFamilyMembers()

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join family'
      console.error('Error joining family:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeMember = async (userId: string) => {
    if (!isAdmin.value) {
      throw new Error('Only admins can remove members')
    }

    if (userId === currentUserId.value) {
      throw new Error('You cannot remove yourself')
    }

    try {
      isLoading.value = true
      error.value = null
      await familyApi.removeMember(userId)
      // Remove from local state
      members.value = members.value.filter(m => m.id !== userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove member'
      console.error('Error removing member:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const leaveFamily = async () => {
    if (isAdmin.value) {
      throw new Error('Admins must transfer ownership before leaving')
    }

    try {
      isLoading.value = true
      error.value = null
      const result = await familyApi.leaveFamily()

      // Update local state
      family.value = result.newFamily

      // Update auth store
      const authStore = useAuthStore()
      authStore.user = {
        ...authStore.user!,
        ...result.user
      }

      // Refresh family members
      await fetchFamilyMembers()

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to leave family'
      console.error('Error leaving family:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    family.value = null
    members.value = []
    invites.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    family,
    members,
    invites,
    isLoading,
    error,
    // Getters
    isAdmin,
    familyName,
    adminMembers,
    regularMembers,
    currentUserId,
    // Actions
    fetchFamily,
    fetchFamilyMembers,
    updateFamilyName,
    createInviteCode,
    loadInvites,
    revokeInvite,
    joinWithCode,
    removeMember,
    leaveFamily,
    clearError,
    reset
  }
})
