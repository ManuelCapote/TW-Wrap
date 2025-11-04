<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Component } from 'vue'
import type { WishListItem } from '@/types'
import { useWishlistStore } from '@/stores/wishlist'
import { useToast } from '@/composables/useToast'
import AddItemForm from '@/components/AddItemForm.vue'
import EditItemForm from '@/components/EditItemForm.vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import {
  Flame,
  CircleDot,
  Feather,
  Package,
  Store,
  Wallet,
  Clock,
  Pencil,
  Trash2,
  ChevronDown,
  ExternalLink
} from 'lucide-vue-next'

const wishlistStore = useWishlistStore()
const { success, error } = useToast()

const showAddForm = ref(false)
const editingItemId = ref<string | null>(null)

// Use store state instead of local refs
const wishlistItems = computed(() => wishlistStore.myWishlist)
const totalItems = computed(() => wishlistStore.totalItems)
const purchasedItems = computed(() => wishlistStore.purchasedItems)
const pendingItems = computed(() => wishlistStore.pendingItems)
const highPriorityPending = computed(() => wishlistStore.highPriorityItems)
const hasItems = computed(() => wishlistStore.hasItems)
const isLoading = computed(() => wishlistStore.isLoading)

const editingItem = computed(() =>
  editingItemId.value
    ? wishlistItems.value.find(item => item.id === editingItemId.value) ?? null
    : null
)

// Load wishlist on mount
onMounted(async () => {
  try {
    await wishlistStore.fetchMyWishlist()
  } catch (error) {
    console.error('Failed to load wishlist:', error)
  }
})

const priorityStyles: Record<
  WishListItem['priority'],
  { label: string; class: string; icon: Component }
> = {
  high: {
    label: 'High',
    class: 'border border-danger-soft bg-danger-soft text-danger',
    icon: Flame
  },
  medium: {
    label: 'Medium',
    class: 'border border-warning-soft bg-warning-soft text-warning',
    icon: CircleDot
  },
  low: {
    label: 'Low',
    class: 'border border-success-soft bg-success-soft text-success',
    icon: Feather
  }
}

const openAddForm = () => {
  editingItemId.value = null
  showAddForm.value = true
}

const addItem = async (itemData: Omit<WishListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    await wishlistStore.createItem({
      title: itemData.title,
      description: itemData.description,
      url: itemData.url,
      imageUrl: itemData.imageUrl,
      price: itemData.price,
      currency: itemData.currency,
      store: itemData.store,
      quantity: itemData.quantity,
      priority: itemData.priority
    })
    showAddForm.value = false
    success('Item added to your wishlist!')
  } catch (err) {
    error('Failed to add item')
    console.error('Failed to add item:', err)
  }
}

const removeItem = async (id: string) => {
  try {
    await wishlistStore.deleteItem(id)
    if (editingItemId.value === id) {
      editingItemId.value = null
    }
    success('Item removed from wishlist')
  } catch (err) {
    error('Failed to remove item')
    console.error('Failed to remove item:', err)
  }
}

const editItem = (id: string) => {
  showAddForm.value = false
  editingItemId.value = id
}

const saveItemEdit = async (updatedItem: WishListItem) => {
  try {
    await wishlistStore.updateItem(updatedItem.id, {
      title: updatedItem.title,
      description: updatedItem.description,
      url: updatedItem.url,
      imageUrl: updatedItem.imageUrl,
      price: updatedItem.price,
      currency: updatedItem.currency,
      store: updatedItem.store,
      quantity: updatedItem.quantity,
      priority: updatedItem.priority
    })
    editingItemId.value = null
    success('Item updated successfully')
  } catch (err) {
    error('Failed to update item')
    console.error('Failed to save item:', err)
  }
}

const cancelEdit = () => {
  editingItemId.value = null
}

const cancelAdd = () => {
  showAddForm.value = false
}

const formatPrice = (item: WishListItem) => {
  if (!item.price) return null
  const currency = item.currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(item.price)
  } catch {
    return `${currency} ${item.price.toFixed(2)}`
  }
}

const formatUpdatedAt = (item: WishListItem) => {
  const updated = new Date(item.updatedAt)
  return updated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div data-role="page-container" class="min-h-screen bg-background text-text">
    <div data-role="content-wrapper" class="mx-auto max-w-4xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section data-role="section" data-section-type="hero" class="space-y-4">
        <p data-role="eyebrow-label" class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          My wishlist
        </p>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="space-y-3">
            <h1 data-role="page-title" class="text-4xl font-semibold tracking-tight md:text-5xl">
              Curate gifts you'll love
            </h1>
            <p data-role="page-description" class="max-w-2xl text-base text-text-secondary md:text-lg">
              Keep your personal wishlist tidy, add inspiration quickly, and share context that helps your family gift with confidence.
            </p>
          </div>
          <button
            type="button"
            data-role="button"
            data-action="add-item"
            class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="openAddForm"
          >
            Add item
          </button>
        </div>
      </section>

      <section data-role="grid" data-grid-type="stats" class="grid gap-5 md:grid-cols-3">
        <div data-role="stat-card" data-stat-type="total-items" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Total items</p>
          <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ totalItems }}</p>
          <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">
            {{ pendingItems }} active • {{ purchasedItems }} fulfilled
          </p>
        </div>
        <div data-role="stat-card" data-stat-type="high-priority" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">High priority</p>
          <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ highPriorityPending }}</p>
          <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">
            Items marked "Need soon"
          </p>
        </div>
        <div data-role="stat-card" data-stat-type="completion" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Status</p>
          <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">
            {{
              totalItems
                ? Math.round((purchasedItems / totalItems) * 100)
                : 0
            }}%
          </p>
          <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">Completed</p>
        </div>
      </section>

      <section data-role="section" data-section-type="forms" class="space-y-6">
        <Transition name="fade" mode="out-in">
          <AddItemForm
            v-if="showAddForm"
            key="add-form"
            @save="addItem"
            @cancel="cancelAdd"
          />
        </Transition>
        <Transition name="fade" mode="out-in">
          <EditItemForm
            v-if="editingItem"
            :key="editingItem?.id"
            :item="editingItem"
            @save="saveItemEdit"
            @cancel="cancelEdit"
          />
        </Transition>
      </section>

      <section data-role="section" data-section-type="items-list" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div data-role="section-header" class="flex items-center justify-between gap-4">
          <div data-role="header-content">
            <p data-role="section-title" class="text-sm font-semibold text-text">Wishlist items</p>
            <p data-role="section-description" class="mt-1 text-xs text-text-secondary">
              Items are saved locally for now—perfect for shaping the experience before wiring up the API.
            </p>
          </div>
        </div>

        <div v-if="hasItems" data-role="list" data-list-type="item-disclosures" class="mt-6 space-y-4">
          <Disclosure
            v-for="item in wishlistItems"
            :key="item.id"
            v-slot="{ open }"
            as="article"
            data-role="disclosure"
            data-disclosure-type="item"
            :data-item-id="item.id"
            :data-state="open ? 'open' : 'closed'"
            :data-priority="item.priority"
            class="group rounded-2xl border border-border bg-surface-muted/40 px-3 py-2 shadow-sm shadow-black/10 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/15"
          >
            <div data-role="disclosure-header" class="flex flex-col gap-3 rounded-xl px-3 py-3 transition duration-200 ease-soft-snap hover:bg-surface-muted/60">
              <div class="flex flex-wrap items-center gap-3">
                <DisclosureButton
                  data-role="disclosure-trigger"
                  class="flex flex-1 items-center justify-between gap-4 text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div data-role="item-info" class="flex flex-1 items-center gap-3">
                    <span data-role="item-title" class="flex-1 truncate">{{ item.title }}</span>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  data-role="button"
                  data-action="view-external"
                  class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
                  @click.stop
                >
                  <ExternalLink :size="12" :stroke-width="1.8" />
                  View
                </a>
                    <span
                      v-else
                      data-role="badge"
                      data-badge-type="no-link"
                      class="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-text-tertiary"
                    >
                      <ExternalLink :size="12" :stroke-width="1.8" />
                      No link
                    </span>
                  </div>
                  <ChevronDown
                    data-role="disclosure-icon"
                    :class="[
                      'h-4 w-4 flex-shrink-0 text-text-tertiary transition duration-200 ease-soft-snap',
                      open ? 'rotate-180' : ''
                    ]"
                  />
                </DisclosureButton>

                <span
                  data-role="badge"
                  data-badge-type="priority"
                  :data-priority="item.priority"
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="priorityStyles[item.priority].class"
                >
                  <component
                    :is="priorityStyles[item.priority].icon"
                    :size="14"
                    :stroke-width="1.8"
                    data-role="badge-icon"
                  />
                  <span data-role="badge-label">{{ priorityStyles[item.priority].label }}</span>
                </span>
                <span data-role="badge" data-badge-type="quantity" class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
                  Qty {{ item.quantity }}
                </span>
              </div>
            </div>

            <Transition name="accordion">
              <DisclosurePanel
                data-role="disclosure-panel"
                class="space-y-4 rounded-xl border border-border bg-surface-muted/40 px-4 py-4 text-sm text-text-secondary"
              >
                <div data-role="item-metadata" class="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span
                    v-if="item.store"
                    data-role="badge"
                    data-badge-type="store"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Store :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    {{ item.store }}
                  </span>
                  <span
                    v-if="formatPrice(item)"
                    data-role="badge"
                    data-badge-type="price"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Wallet :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    {{ formatPrice(item) }}
                  </span>
                  <span
                    data-role="badge"
                    data-badge-type="quantity"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Package :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    Quantity {{ item.quantity }}
                  </span>
                </div>

                <p v-if="item.description" data-role="item-description" class="text-sm text-text-secondary">
                  {{ item.description }}
                </p>

                <div data-role="item-actions" class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
                  <div data-role="item-timestamp" class="flex items-center gap-2">
                    <Clock :size="14" :stroke-width="1.8" />
                    Updated {{ formatUpdatedAt(item) }}
                  </div>
                  <div data-role="action-buttons" class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-role="button"
                      data-action="edit"
                      class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-text"
                      @click="editItem(item.id)"
                    >
                      <Pencil :size="14" :stroke-width="1.8" />
                      Edit
                    </button>
                    <button
                      type="button"
                      data-role="button"
                      data-action="remove"
                      class="inline-flex items-center gap-2 rounded-md border border-danger bg-background px-3 py-2 text-xs font-semibold text-danger transition duration-150 ease-soft-snap hover:bg-danger-soft hover:text-danger"
                      @click="removeItem(item.id)"
                    >
                      <Trash2 :size="14" :stroke-width="1.8" />
                      Remove
                    </button>
                  </div>
                </div>
              </DisclosurePanel>
            </Transition>
          </Disclosure>
        </div>

        <div
          v-else
          data-role="empty-state"
          data-empty-type="no-items"
          class="mt-6 space-y-4 rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center"
        >
          <h3 data-role="empty-title" class="text-lg font-semibold text-text">Your wishlist is empty</h3>
          <p data-role="empty-message" class="text-sm text-text-secondary">
            Add a few ideas so your family knows exactly what will make your day.
          </p>
          <button
            type="button"
            data-role="button"
            data-action="add-first-item"
            class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="openAddForm"
          >
            Add your first item
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.18s ease;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
