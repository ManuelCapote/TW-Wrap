<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import RoleBadge from './RoleBadge.vue'
import { User, Info } from 'lucide-vue-next'

const familyStore = useFamilyStore()

const members = computed(() => familyStore.members)
const isAdmin = computed(() => familyStore.isAdmin)
const currentUserId = computed(() => familyStore.currentUserId)

const canRemoveMember = (memberId: string, memberRole: string) => {
  // Can't remove yourself
  if (memberId === currentUserId.value) return false
  // Can't remove other admins
  if (memberRole === 'ADMIN') return false
  // Only admins can remove members
  return isAdmin.value
}

const handleRemoveMember = async (userId: string, memberName: string) => {
  if (!confirm(`Remove ${memberName} from the family?\n\nThey will no longer have access to family wishlists.`)) {
    return
  }

  try {
    await familyStore.removeMember(userId)
  } catch (error) {
    alert('Failed to remove member: ' + (error as Error).message)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  familyStore.fetchFamilyMembers()
})
</script>

<template>
  <div class="member-management">
    <div v-if="familyStore.isLoading" class="loading">
      Loading members...
    </div>

    <div v-else-if="members.length === 0" class="empty-state">
      <p>No family members found</p>
    </div>

    <div v-else class="members-grid">
      <div
        v-for="member in members"
        :key="member.id"
        class="member-card"
        :class="{ 'is-current-user': member.id === currentUserId }"
      >
        <div class="member-header">
          <div class="member-avatar">
            <User v-if="!member.avatar" :size="24" :stroke-width="2" />
            <span v-else>{{ member.avatar }}</span>
          </div>
          <div class="member-info">
            <div class="member-name">
              {{ member.name }}
              <span v-if="member.id === currentUserId" class="you-badge">You</span>
            </div>
            <div class="member-email">{{ member.email }}</div>
          </div>
        </div>

        <div class="member-details">
          <div class="detail-item">
            <span class="detail-label">Role:</span>
            <RoleBadge :role="member.role" size="small" />
          </div>

          <div class="detail-item">
            <span class="detail-label">Joined:</span>
            <span class="detail-value">{{ formatDate(member.createdAt) }}</span>
          </div>
        </div>

        <div v-if="canRemoveMember(member.id, member.role)" class="member-actions">
          <button
            @click="handleRemoveMember(member.id, member.name)"
            class="btn-remove"
          >
            Remove from Family
          </button>
        </div>

        <div v-else-if="member.role === 'ADMIN' && member.id !== currentUserId" class="admin-note">
          <Info :size="16" :stroke-width="2" class="note-icon" />
          <span class="note-text">Cannot remove admin members</span>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="members.length > 0" class="members-summary">
      <div class="summary-stat">
        <span class="stat-value">{{ members.length }}</span>
        <span class="stat-label">Total Members</span>
      </div>
      <div class="summary-stat">
        <span class="stat-value">{{ familyStore.adminMembers.length }}</span>
        <span class="stat-label">Admins</span>
      </div>
      <div class="summary-stat">
        <span class="stat-value">{{ familyStore.regularMembers.length }}</span>
        <span class="stat-label">Members</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.member-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s;
}

.member-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.member-card.is-current-user {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.member-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
  color: white;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.you-badge {
  font-size: 0.625rem;
  font-weight: 700;
  background: var(--color-primary);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-email {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--color-text);
}

.member-actions {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.btn-remove {
  width: 100%;
  padding: 0.625rem;
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: var(--color-danger);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

.admin-note {
  padding: 0.75rem;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.note-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.note-text {
  flex: 1;
}

/* Summary Stats */
.members-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
