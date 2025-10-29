<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WishListItem, ProductPreview } from '@/types'
import { parseProductUrl, isValidProductUrl } from '@/utils/urlParser'
import { CheckCircle, MapPin } from 'lucide-vue-next'

interface Emits {
  (e: 'save', item: Omit<WishListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

const urlInput = ref('')
const isLoading = ref(false)
const error = ref('')
const productPreview = ref<ProductPreview | null>(null)
const lastParsedUrl = ref<string | null>(null)

const formData = ref({
  title: '',
  description: '',
  price: 0,
  currency: 'USD',
  store: '',
  quantity: 1,
  priority: 'medium' as 'low' | 'medium' | 'high'
})

const trimmedUrl = computed(() => urlInput.value.trim())

const canParseUrl = computed(() => {
  return trimmedUrl.value && isValidProductUrl(trimmedUrl.value)
})

const hasInvalidUrl = computed(() => {
  return Boolean(trimmedUrl.value) && !isValidProductUrl(trimmedUrl.value)
})

const canSave = computed(() => {
  return formData.value.title.trim() && 
         formData.value.quantity > 0
})

const parseUrl = async () => {
  if (!canParseUrl.value) return
  
  isLoading.value = true
  error.value = ''
  productPreview.value = null
  
  try {
    const preview = await parseProductUrl(trimmedUrl.value)
    productPreview.value = preview
    lastParsedUrl.value = trimmedUrl.value
    
    // Auto-fill form with parsed data (only name and store)
    formData.value.title = preview.title
    formData.value.store = preview.store || ''
    // Leave other fields as user-entered values
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to parse URL'
    // Keep any manually entered data
  } finally {
    isLoading.value = false
  }
}

const handleSave = () => {
  if (!canSave.value) return
  
  const url = trimmedUrl.value
  const validUrl = url && isValidProductUrl(url) ? url : undefined
  const description = formData.value.description.trim()
  const store = formData.value.store.trim()

  const newItem = {
    title: formData.value.title.trim(),
    description: description || undefined,
    url: validUrl,
    imageUrl: productPreview.value?.imageUrl,
    price: formData.value.price || undefined,
    currency: formData.value.currency || undefined,
    store: store || undefined,
    quantity: formData.value.quantity,
    priority: formData.value.priority,
    isPurchased: false
  }
  
  emit('save', newItem)
  resetForm()
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  urlInput.value = ''
  productPreview.value = null
  error.value = ''
  lastParsedUrl.value = null
  formData.value = {
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    store: '',
    quantity: 1,
    priority: 'medium'
  }
}

watch(trimmedUrl, (currentUrl) => {
  if (!currentUrl) {
    error.value = ''
  }

  if (currentUrl !== lastParsedUrl.value) {
    productPreview.value = null
  }
})
</script>

<template>
  <div class="add-form">
    <h3>Add New Item to Wishlist</h3>
    
    <!-- URL Input Section -->
    <div class="url-section">
      <div class="form-group">
        <label for="url">Product Link (optional)</label>
        <p class="field-hint">
          Paste a link to auto-fill the details, or leave this blank to save the item manually.
        </p>
        <div class="url-input-group">
          <input
            id="url"
            v-model="urlInput"
            type="url"
            placeholder="Paste product link from any store..."
            class="url-input"
            @keyup.enter="parseUrl"
          />
          <button 
            type="button"
            @click="parseUrl" 
            :disabled="!canParseUrl || isLoading"
            class="parse-btn"
          >
            {{ isLoading ? 'Parsing...' : 'Parse' }}
          </button>
        </div>
        <p v-if="hasInvalidUrl" class="invalid-url-hint">
          This link doesn't look valid. We'll save the item without it, or paste the full URL (including https://) to enable parsing.
        </p>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Extracting product information...</span>
      </div>
    </div>

    <!-- Product Preview -->
    <div v-if="productPreview" class="product-preview">
      <h4>
        <CheckCircle :size="16" :stroke-width="2" class="success-icon" />
        Successfully Parsed
      </h4>
      <div class="preview-content">
        <div class="preview-details">
          <h5>{{ productPreview.title }}</h5>
          <div class="preview-meta">
            <span v-if="productPreview.store" class="preview-store">
              <MapPin :size="14" :stroke-width="2" class="store-icon" />
              {{ productPreview.store }}
            </span>
            <span class="extracted-note">Name and store extracted from URL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editable Form -->
    <form @submit.prevent="handleSave" class="item-form">
      <div class="form-group">
        <label for="title">Name *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="Product name"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Optional description"
          class="form-textarea"
          rows="2"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="price">Price</label>
          <input
            id="price"
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="currency">Currency</label>
          <select id="currency" v-model="formData.currency" class="form-select">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="store">Store</label>
          <input
            id="store"
            v-model="formData.store"
            type="text"
            placeholder="e.g. Amazon, Target"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="quantity">Quantity</label>
          <input
            id="quantity"
            v-model.number="formData.quantity"
            type="number"
            min="1"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="priority">Priority</label>
        <select id="priority" v-model="formData.priority" class="form-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="!canSave" class="save-btn">
          Add to Wishlist
        </button>
        <button type="button" @click="handleCancel" class="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-form {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.add-form h3 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-text);
}

.url-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.field-hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.url-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.parse-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.parse-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.parse-btn:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.invalid-url-hint {
  margin-top: var(--spacing-sm);
  font-size: 13px;
  color: #e74c3c;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-md);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-preview {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: #e8f5e9;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-success);
}

.product-preview h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-success);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.success-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.preview-content {
  display: flex;
  gap: var(--spacing-md);
}

.preview-details {
  flex: 1;
}

.preview-details h5 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
  font-size: 15px;
}

.preview-details p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.preview-meta {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.preview-store {
  color: var(--color-text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.store-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.extracted-note {
  color: var(--color-success);
  font-size: 12px;
  font-weight: 600;
  background: #e8f5e9;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.item-form {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: var(--color-error);
  font-size: 13px;
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-error-bg);
  border-radius: var(--radius-sm);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.save-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 15px;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.save-btn:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
}

.cancel-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .add-form {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .url-input-group {
    flex-direction: column;
  }

  .url-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .parse-btn {
    width: 100%;
  }

  .form-input,
  .form-textarea,
  .form-select {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .add-form h3 {
    font-size: 1.1rem;
  }
}
</style>
