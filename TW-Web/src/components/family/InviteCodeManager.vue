<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'

const familyStore = useFamilyStore()

// Form state
const expiresInDays = ref(7)
const maxUses = ref(10)
const isCreating = ref(false)

// Modal state
const showNewCodeModal = ref(false)
const newlyCreatedCode = ref('')
const copiedCode = ref('')

// Computed
const activeInvites = computed(() => familyStore.invites)
const hasInvites = computed(() => activeInvites.value.length > 0)

// Actions
const handleCreateInvite = async () => {
  try {
    isCreating.value = true
    const invite = await familyStore.createInviteCode({
      expiresInDays: expiresInDays.value,
      maxUses: maxUses.value
    })
    newlyCreatedCode.value = invite.code
    showNewCodeModal.value = true
  } catch (error) {
    alert('Failed to create invite code: ' + (error as Error).message)
  } finally {
    isCreating.value = false
  }
}

const handleRevokeInvite = async (code: string) => {
  if (!confirm(`Are you sure you want to revoke invite code ${code}?`)) {
    return
  }

  try {
    await familyStore.revokeInvite(code)
  } catch (error) {
    alert('Failed to revoke invite: ' + (error as Error).message)
  }
}

const copyToClipboard = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = code
    setTimeout(() => {
      copiedCode.value = ''
    }, 2000)
  } catch (error) {
    alert('Failed to copy code')
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isExpired = (date: Date) => {
  return new Date(date) < new Date()
}

const getUsageStatus = (currentUses: number, maxUses: number) => {
  const percentage = (currentUses / maxUses) * 100
  if (percentage >= 100) return 'full'
  if (percentage >= 75) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

const closeModal = () => {
  showNewCodeModal.value = false
  newlyCreatedCode.value = ''
}

onMounted(() => {
  familyStore.loadInvites()
})
</script>

<template>
  <div class="invite-manager">
    <!-- Create Invite Section -->
    <div class="create-section">
      <h3>Create New Invite Code</h3>
      <div class="create-form">
        <div class="form-row">
          <div class="form-group">
            <label for="expires">Expires In (days)</label>
            <input
              id="expires"
              v-model.number="expiresInDays"
              type="number"
              min="1"
              max="30"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="maxUses">Max Uses</label>
            <input
              id="maxUses"
              v-model.number="maxUses"
              type="number"
              min="1"
              max="100"
              class="form-input"
            />
          </div>
        </div>

        <button
          @click="handleCreateInvite"
          :disabled="isCreating || familyStore.isLoading"
          class="btn btn-primary"
        >
          {{ isCreating ? 'Creating...' : 'Generate Invite Code' }}
        </button>
      </div>
    </div>

    <!-- Active Invites List -->
    <div class="invites-section">
      <h3>Active Invite Codes</h3>

      <div v-if="familyStore.isLoading" class="loading">
        Loading invites...
      </div>

      <div v-else-if="!hasInvites" class="empty-state">
        <p>No active invite codes</p>
        <p class="empty-hint">Create your first invite code above to invite family members</p>
      </div>

      <div v-else class="invites-list">
        <div
          v-for="invite in activeInvites"
          :key="invite.id"
          class="invite-card"
          :class="{ expired: isExpired(invite.expiresAt) }"
        >
          <div class="invite-header">
            <div class="invite-code-display">
              <span class="code-label">Code:</span>
              <code class="invite-code">{{ invite.code }}</code>
              <button
                @click="copyToClipboard(invite.code)"
                class="btn-icon"
                :class="{ copied: copiedCode === invite.code }"
                title="Copy to clipboard"
              >
                {{ copiedCode === invite.code ? '✓' : '📋' }}
              </button>
            </div>

            <button
              @click="handleRevokeInvite(invite.code)"
              class="btn-danger-small"
              title="Revoke invite"
            >
              Revoke
            </button>
          </div>

          <div class="invite-details">
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(invite.createdAt) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Expires:</span>
              <span class="detail-value" :class="{ expired: isExpired(invite.expiresAt) }">
                {{ formatDate(invite.expiresAt) }}
                <span v-if="isExpired(invite.expiresAt)" class="expired-badge">EXPIRED</span>
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Usage:</span>
              <span class="detail-value">
                <span class="usage-count" :class="getUsageStatus(invite.currentUses, invite.maxUses)">
                  {{ invite.currentUses }} / {{ invite.maxUses }}
                </span>
                <div class="usage-bar">
                  <div
                    class="usage-fill"
                    :class="getUsageStatus(invite.currentUses, invite.maxUses)"
                    :style="{ width: `${(invite.currentUses / invite.maxUses) * 100}%` }"
                  ></div>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Code Modal -->
    <div v-if="showNewCodeModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Invite Code Created! 🎉</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <p class="modal-message">Share this code with family members to invite them:</p>

          <div class="new-code-display">
            <code class="new-invite-code">{{ newlyCreatedCode }}</code>
            <button
              @click="copyToClipboard(newlyCreatedCode)"
              class="btn btn-primary"
            >
              {{ copiedCode === newlyCreatedCode ? 'Copied! ✓' : 'Copy Code' }}
            </button>
          </div>

          <p class="modal-hint">
            This code will expire in {{ expiresInDays }} days and can be used {{ maxUses }} times.
          </p>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invite-manager {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Create Section */
.create-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.create-section h3 {
  margin: 0 0 1rem;
  color: var(--color-text);
  font-size: 1.125rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Invites Section */
.invites-section h3 {
  margin: 0 0 1rem;
  color: var(--color-text);
  font-size: 1.125rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin: 0;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.invites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Invite Card */
.invite-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.invite-card:hover {
  box-shadow: var(--shadow-md);
}

.invite-card.expired {
  opacity: 0.6;
  background: var(--color-surface-variant);
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.invite-code-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.invite-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-background);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  letter-spacing: 2px;
}

.invite-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-value.expired {
  color: var(--color-danger);
}

.expired-badge {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.usage-count {
  font-weight: 600;
}

.usage-count.full {
  color: var(--color-danger);
}

.usage-count.high {
  color: #f59e0b;
}

.usage-count.medium {
  color: #3b82f6;
}

.usage-count.low {
  color: #10b981;
}

.usage-bar {
  width: 100px;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.usage-fill.full {
  background: var(--color-danger);
}

.usage-fill.high {
  background: #f59e0b;
}

.usage-fill.medium {
  background: #3b82f6;
}

.usage-fill.low {
  background: #10b981;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-danger-small {
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-small:hover {
  background: var(--color-danger);
  color: white;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: var(--color-surface-variant);
}

.btn-icon.copied {
  color: #10b981;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close:hover {
  background: var(--color-surface-variant);
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  margin: 0 0 1.5rem;
  color: var(--color-text-secondary);
}

.new-code-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-background);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.new-invite-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
  letter-spacing: 4px;
}

.modal-hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
</style>
