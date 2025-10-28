<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { Users, Pencil, Check, X, Calendar, Crown } from 'lucide-vue-next'

const familyStore = useFamilyStore()

const isEditing = ref(false)
const editedName = ref('')
const isSaving = ref(false)

const family = computed(() => familyStore.family)
const memberCount = computed(() => familyStore.members.length)

const startEdit = () => {
  editedName.value = family.value?.name || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editedName.value = ''
}

const saveEdit = async () => {
  if (!editedName.value.trim()) {
    alert('Family name cannot be empty')
    return
  }

  try {
    isSaving.value = true
    await familyStore.updateFamilyName(editedName.value.trim())
    isEditing.value = false
  } catch (error) {
    alert('Failed to update family name: ' + (error as Error).message)
  } finally {
    isSaving.value = false
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  if (!family.value) {
    familyStore.fetchFamily()
  }
})
</script>

<template>
  <div class="family-info-card">
    <div v-if="familyStore.isLoading" class="loading">
      Loading family info...
    </div>

    <div v-else-if="!family" class="empty">
      <p>No family information available</p>
    </div>

    <div v-else class="info-content">
      <div class="info-header">
        <div class="family-icon">
          <Users :size="48" :stroke-width="1.5" />
        </div>
        <div class="family-details">
          <div v-if="!isEditing" class="family-name-display">
            <h2 class="family-name">{{ family.name }}</h2>
            <button
              v-if="familyStore.isAdmin"
              @click="startEdit"
              class="btn-edit"
              title="Edit family name"
            >
              <Pencil :size="18" :stroke-width="2" />
            </button>
          </div>

          <div v-else class="family-name-edit">
            <input
              v-model="editedName"
              type="text"
              class="name-input"
              placeholder="Enter family name"
              @keyup.enter="saveEdit"
              @keyup.esc="cancelEdit"
              autofocus
            />
            <div class="edit-actions">
              <button
                @click="saveEdit"
                :disabled="isSaving"
                class="btn-save"
              >
                <Check v-if="!isSaving" :size="18" :stroke-width="2.5" />
                <span v-else>...</span>
              </button>
              <button
                @click="cancelEdit"
                :disabled="isSaving"
                class="btn-cancel"
              >
                <X :size="18" :stroke-width="2.5" />
              </button>
            </div>
          </div>

          <div class="family-meta">
            <span class="meta-item">
              <Users :size="16" :stroke-width="2" class="meta-icon" />
              <span class="meta-text">{{ memberCount }} member{{ memberCount !== 1 ? 's' : '' }}</span>
            </span>
            <span class="meta-item">
              <Calendar :size="16" :stroke-width="2" class="meta-icon" />
              <span class="meta-text">Created {{ formatDate(family.createdAt) }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="info-footer" v-if="familyStore.isAdmin">
        <div class="admin-badge">
          <Crown :size="18" :stroke-width="2" class="badge-icon" />
          <span class="badge-text">You are an Admin of this family</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.family-info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.family-icon {
  flex-shrink: 0;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.family-details {
  flex: 1;
  min-width: 0;
}

.family-name-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.family-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.btn-edit {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  color: var(--color-text-secondary);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit:hover {
  color: var(--color-text);
  background: var(--color-surface-muted);
}

.family-name-edit {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.name-input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 600;
}

.name-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-save,
.btn-cancel {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save {
  background: var(--color-success);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--color-border);
  color: var(--color-text);
}

.family-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-icon {
  display: flex;
  align-items: center;
  color: var(--color-text-tertiary);
}

.info-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--color-warning);
  color: #78350f;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-icon {
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 640px) {
  .info-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .family-name {
    font-size: 1.5rem;
  }

  .family-meta {
    justify-content: center;
  }
}
</style>
