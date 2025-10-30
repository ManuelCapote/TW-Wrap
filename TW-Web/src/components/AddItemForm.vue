<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

const canParseUrl = computed(() => trimmedUrl.value && isValidProductUrl(trimmedUrl.value))
const hasInvalidUrl = computed(() => Boolean(trimmedUrl.value) && !isValidProductUrl(trimmedUrl.value))
const canSave = computed(() => formData.value.title.trim() && formData.value.quantity > 0)

const parseUrl = async () => {
  if (!canParseUrl.value) return

  isLoading.value = true
  error.value = ''
  productPreview.value = null

  try {
    const preview = await parseProductUrl(trimmedUrl.value)
    productPreview.value = preview
    lastParsedUrl.value = trimmedUrl.value

    formData.value.title = preview.title
    formData.value.store = preview.store || ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to parse URL'
  } finally {
    isLoading.value = false
  }
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

watch(trimmedUrl, currentUrl => {
  if (!currentUrl) {
    error.value = ''
  }

  if (currentUrl !== lastParsedUrl.value) {
    productPreview.value = null
  }
})
</script>

<template>
  <div data-role="form-container" data-form-type="add-item" class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20 md:px-8 md:py-8">
    <div data-role="form-header" class="flex flex-wrap items-start justify-between gap-6">
      <div class="space-y-2">
        <h3 data-role="form-title" class="text-xl font-semibold tracking-tight text-text">Add new item</h3>
        <p data-role="form-description" class="text-sm text-text-secondary">
          Paste a product link to auto-fill details or add the essentials manually.
        </p>
      </div>
      <button
        type="button"
        data-role="button"
        data-action="cancel"
        class="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
        @click="handleCancel"
      >
        Cancel
      </button>
    </div>

    <form data-role="form" class="mt-6 space-y-6" @submit.prevent="handleSave">
      <fieldset data-role="form-group" data-group-type="url-parser" class="space-y-4 rounded-xl border border-border bg-surface-muted/40 px-4 py-4">
        <legend class="px-2 text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Optional link
        </legend>

        <div class="space-y-2">
          <label for="url" data-role="form-label" class="text-sm font-semibold text-text">Product link</label>
          <p class="text-xs text-text-secondary">
            Paste a store link to pull the name and store automatically.
          </p>
          <div class="flex flex-col gap-3 md:flex-row">
            <input
              id="url"
              v-model="urlInput"
              type="url"
              data-role="form-input"
              data-input-type="url"
              :data-validation-state="hasInvalidUrl ? 'invalid' : 'valid'"
              placeholder="https://example.com/your-item"
              :class="[
                'flex-1 rounded-md border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40',
                hasInvalidUrl ? 'border-danger focus:ring-danger/40' : 'border-border',
                isLoading ? 'opacity-70' : ''
              ]"
              @keyup.enter="parseUrl"
            />
            <button
              type="button"
              data-role="button"
              data-action="parse-url"
              :data-loading="isLoading"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
              :disabled="!canParseUrl || isLoading"
              @click="parseUrl"
            >
              {{ isLoading ? 'Parsing…' : 'Parse link' }}
            </button>
          </div>
          <p v-if="hasInvalidUrl" data-role="form-error" class="text-xs text-danger">
            This link doesn't look valid. We'll save the item without it, or add the full URL (including https://).
          </p>
        </div>

        <div v-if="error" data-role="alert" data-alert-type="error" class="rounded-lg border border-danger-soft bg-danger-soft px-3 py-2 text-xs text-danger">
          {{ error }}
        </div>

        <div v-if="isLoading" data-role="loading-indicator" class="flex items-center gap-2 text-xs text-text-secondary">
          <span class="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
          Extracting product information…
        </div>

        <div
          v-if="productPreview"
          data-role="preview-card"
          data-card-type="product-preview"
          class="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text"
        >
          <div>
            <div class="flex items-center gap-2">
              <CheckCircle :size="16" :stroke-width="2" class="text-success" />
              <p data-role="preview-title" class="font-semibold">{{ productPreview.title }}</p>
            </div>
            <div data-role="preview-metadata" class="mt-1 flex items-center gap-2 text-xs text-text-secondary">
              <span v-if="productPreview.store" class="inline-flex items-center gap-1">
                <MapPin :size="12" :stroke-width="2" />
                {{ productPreview.store }}
              </span>
              <span data-role="badge" data-badge-type="status" class="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-widest text-text-tertiary">
                Name and store extracted
              </span>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="grid gap-6 md:grid-cols-2">
        <div data-role="form-group" class="space-y-2">
          <label for="title" data-role="form-label" class="text-sm font-semibold text-text">Name *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            data-role="form-input"
            data-input-type="title"
            placeholder="Product name"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
        <div data-role="form-group" class="space-y-2">
          <label for="store" data-role="form-label" class="text-sm font-semibold text-text">Store</label>
          <input
            id="store"
            v-model="formData.store"
            type="text"
            data-role="form-input"
            data-input-type="store"
            placeholder="Amazon, Target…"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div data-role="form-group" class="space-y-2">
        <label for="description" data-role="form-label" class="text-sm font-semibold text-text">Notes</label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          data-role="form-input"
          data-input-type="description"
          placeholder="Share size, color, or context that helps someone pick the perfect version."
          class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
        ></textarea>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div data-role="form-group" class="space-y-2">
          <label for="quantity" data-role="form-label" class="text-sm font-semibold text-text">Quantity *</label>
          <input
            id="quantity"
            v-model.number="formData.quantity"
            min="1"
            type="number"
            data-role="form-input"
            data-input-type="quantity"
            placeholder="1"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
        <div data-role="form-group" class="space-y-2">
          <label for="price" data-role="form-label" class="text-sm font-semibold text-text">Price</label>
          <div class="flex gap-2">
            <input
              id="price"
              v-model.number="formData.price"
              min="0"
              type="number"
              step="0.01"
              data-role="form-input"
              data-input-type="price"
              placeholder="0.00"
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
            />
            <select
              v-model="formData.currency"
              data-role="form-input"
              data-input-type="currency"
              class="rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
            >
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div data-role="form-group" class="space-y-2">
          <label for="priority" data-role="form-label" class="text-sm font-semibold text-text">Priority</label>
          <select
            id="priority"
            v-model="formData.priority"
            data-role="form-input"
            data-input-type="priority"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div data-role="form-actions" class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-text-tertiary">
        <p>
          These items are stored locally for now. When the API is ready, we'll sync everything automatically.
        </p>
        <div class="flex gap-2">
          <button
            type="submit"
            data-role="button"
            data-action="submit"
            :disabled="!canSave"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
          >
            Save item
          </button>
          <button
            type="button"
            data-role="button"
            data-action="cancel"
            class="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
            @click="handleCancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
