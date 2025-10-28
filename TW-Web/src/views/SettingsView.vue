<script setup lang="ts">
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/family'
import FamilyInfoCard from '@/components/family/FamilyInfoCard.vue'
import MemberManagement from '@/components/family/MemberManagement.vue'
import InviteCodeManager from '@/components/family/InviteCodeManager.vue'
import JoinFamilyModal from '@/components/family/JoinFamilyModal.vue'

const familyStore = useFamilyStore()
const showJoinModal = ref(false)
const successMessage = ref<string | null>(null)

const handleJoinSuccess = async () => {
  showJoinModal.value = false
  successMessage.value = 'Successfully joined new family!'

  // Refresh family data
  await familyStore.fetchFamilyMembers()
  await familyStore.fetchFamily()

  // Clear success message after 5 seconds
  setTimeout(() => {
    successMessage.value = null
  }, 5000)
}
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1 class="page-title">Family Settings</h1>
      <p class="page-description">
        Manage your family, invite new members, and configure settings
      </p>
    </div>

    <div class="settings-content">
      <!-- Family Info Section -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Family Information</h2>
          <p class="section-description">View and edit your family details</p>
        </div>
        <FamilyInfoCard />
      </section>

      <!-- Members Section -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Family Members</h2>
          <p class="section-description">
            View and manage who has access to your family wishlists
          </p>
        </div>
        <MemberManagement />
      </section>

      <!-- Invite Codes Section (Admin Only) -->
      <section v-if="familyStore.isAdmin" class="settings-section">
        <div class="section-header">
          <div class="section-title-row">
            <h2 class="section-title">Invite Codes</h2>
            <span class="admin-badge-small">Admin Only</span>
          </div>
          <p class="section-description">
            Generate invite codes to add new members to your family
          </p>
        </div>
        <InviteCodeManager />
      </section>

      <!-- Member Info (Non-Admin) -->
      <section v-else class="settings-section info-section">
        <div class="info-card">
          <div class="info-icon">ℹ️</div>
          <div class="info-content">
            <h3 class="info-title">Member Account</h3>
            <p class="info-text">
              You are a member of this family. Contact a family admin to invite new members
              or make changes to family settings.
            </p>
          </div>
        </div>

        <!-- Join Another Family Button -->
        <div class="join-family-section">
          <button @click="showJoinModal = true" class="btn-join-family">
            <span class="btn-icon">🎫</span>
            <span class="btn-text">Join Another Family</span>
          </button>
          <p class="join-hint">
            Have an invite code? Join a different family here
          </p>
        </div>
      </section>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        <span class="success-icon">✅</span>
        <span class="success-text">{{ successMessage }}</span>
        <button @click="successMessage = null" class="success-dismiss">✕</button>
      </div>

      <!-- Error Display -->
      <div v-if="familyStore.error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ familyStore.error }}</span>
        <button @click="familyStore.clearError()" class="error-dismiss">✕</button>
      </div>
    </div>

    <!-- Join Family Modal -->
    <JoinFamilyModal
      :is-open="showJoinModal"
      :current-family-name="familyStore.familyName"
      @close="showJoinModal = false"
      @success="handleJoinSuccess"
    />
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.page-description {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.section-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.admin-badge-small {
  font-size: 0.625rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Info Section (for non-admins) */
.info-section {
  margin-top: 1rem;
}

.info-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.info-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: 12px;
  color: var(--color-danger);
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-dismiss {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--color-danger);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.error-dismiss:hover {
  opacity: 1;
}

/* Join Family Section */
.join-family-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.btn-join-family {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-join-family:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.btn-text {
  font-size: inherit;
}

.join-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Success Message */
.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  border-radius: 12px;
  color: #10b981;
}

.success-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.success-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.success-dismiss {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #10b981;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.success-dismiss:hover {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .settings-content {
    gap: 2rem;
  }

  .btn-join-family {
    width: 100%;
    justify-content: center;
  }
}
</style>
