<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WishListItem } from '@/types'

interface Props {
  item: WishListItem
}

interface Emits {
  (e: 'save', item: WishListItem): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref({
  title: props.item.title,
  quantity: props.item.quantity,
  priority: props.item.priority
})

const errors = ref<Record<string, string>>({})

const isValid = computed(() => {
  return formData.value.title.trim() && formData.value.quantity > 0
})

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Name is required'
  }
  
  if (formData.value.quantity <= 0) {
    errors.value.quantity = 'Quantity must be greater than 0'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSave = () => {
  if (!validateForm()) return
  
  const updatedItem: WishListItem = {
    ...props.item,
    title: formData.value.title.trim(),
    quantity: formData.value.quantity,
    priority: formData.value.priority,
    updatedAt: new Date()
  }
  
  emit('save', updatedItem)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="edit-form">
    <h3>Edit Wishlist Item</h3>
    
    <form @submit.prevent="handleSave">
      <div class="form-group">
        <label for="title">Name *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="Item name"
          class="form-input"
          :class="{ error: errors.title }"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            min="1"
            placeholder="1"
            class="form-input"
            :class="{ error: errors.quantity }"
          />
          <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
        </div>

        <div class="form-group">
          <label for="priority">Importance</label>
          <select id="priority" v-model="formData.priority" class="form-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="!isValid" class="save-btn">
          Save Changes
        </button>
        <button type="button" @click="handleCancel" class="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-form {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.edit-form h3 {
  margin: 0 0 1.5rem 0;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 1);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: #e74c3c;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.save-btn {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background: hsla(160, 100%, 32%, 1);
}

.save-btn:disabled {
  background: var(--color-border);
  color: var(--color-text);
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--color-background-mute);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .edit-form {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .edit-form h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .form-input,
  .form-textarea,
  .form-select {
    padding: 0.875rem;
    font-size: 1rem; /* Prevents zoom on iOS */
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .save-btn,
  .cancel-btn {
    padding: 0.875rem 1.5rem;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .edit-form {
    padding: 0.75rem;
  }
  
  .edit-form h3 {
    font-size: 1rem;
  }
  
  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }
  
  .form-row {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .form-actions {
    margin-top: 1rem;
  }
}
</style>