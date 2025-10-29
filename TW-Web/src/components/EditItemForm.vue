<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WishListItem } from '@/types'
import { isValidProductUrl } from '@/utils/urlParser'

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
  url: props.item.url || '',
  quantity: props.item.quantity,
  priority: props.item.priority
})

const errors = ref<Record<string, string>>({})

const trimmedUrl = computed(() => formData.value.url.trim())
const hasInvalidUrl = computed(() => Boolean(trimmedUrl.value) && !isValidProductUrl(trimmedUrl.value))
const isValid = computed(() => formData.value.title.trim() && formData.value.quantity > 0 && !hasInvalidUrl.value)

const validateForm = () => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Name is required'
  }

  if (hasInvalidUrl.value) {
    errors.value.url = 'Please enter a valid URL or leave this blank'
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
    url: trimmedUrl.value || undefined,
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
  <div class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20 md:px-8 md:py-8">
    <div class="flex items-start justify-between gap-6">
      <div class="space-y-2">
        <h3 class="text-xl font-semibold tracking-tight text-text">Edit item</h3>
        <p class="text-sm text-text-secondary">
          Update details or remove the product link if you no longer need it.
        </p>
      </div>
      <button
        type="button"
        class="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
        @click="handleCancel"
      >
        Close
      </button>
    </div>

    <form class="mt-6 space-y-6" @submit.prevent="handleSave">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <label for="edit-title" class="text-sm font-semibold text-text">Name *</label>
          <input
            id="edit-title"
            v-model="formData.title"
            type="text"
            placeholder="Item name"
            :class="[
              'w-full rounded-md border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40',
              errors.title ? 'border-danger focus:ring-danger/40' : 'border-border'
            ]"
          />
          <p v-if="errors.title" class="text-xs text-danger">
            {{ errors.title }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="edit-url" class="text-sm font-semibold text-text">Product link</label>
          <p class="text-xs text-text-secondary">
            Paste a store link to make it easy for others to jump straight to the product.
          </p>
          <input
            id="edit-url"
            v-model="formData.url"
            type="url"
            placeholder="https://example.com/your-item"
            :class="[
              'w-full rounded-md border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40',
              errors.url ? 'border-danger focus:ring-danger/40' : 'border-border'
            ]"
          />
          <p v-if="errors.url" class="text-xs text-danger">
            {{ errors.url }}
          </p>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <label for="edit-quantity" class="text-sm font-semibold text-text">Quantity *</label>
          <input
            id="edit-quantity"
            v-model.number="formData.quantity"
            type="number"
            min="1"
            placeholder="1"
            :class="[
              'w-full rounded-md border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40',
              errors.quantity ? 'border-danger focus:ring-danger/40' : 'border-border'
            ]"
          />
          <p v-if="errors.quantity" class="text-xs text-danger">
            {{ errors.quantity }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="edit-priority" class="text-sm font-semibold text-text">Importance</label>
          <select
            id="edit-priority"
            v-model="formData.priority"
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          class="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-text-secondary"
          :disabled="!isValid"
        >
          Save changes
        </button>
      </div>
    </form>
  </div>
</template>
