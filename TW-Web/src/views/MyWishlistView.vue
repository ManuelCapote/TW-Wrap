<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import type { WishListItem } from '@/types'
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

const showAddForm = ref(false)
const editingItemId = ref<string | null>(null)

const wishlistItems = ref<WishListItem[]>([
  {
    id: '1',
    userId: 'user1',
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Wireless noise-canceling headphones',
    url: 'https://amazon.com/sony-wh1000xm5',
    price: 349.99,
    currency: 'USD',
    store: 'Amazon',
    quantity: 1,
    isPurchased: false,
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Instant Pot Duo',
    description: '7-in-1 Electric Pressure Cooker',
    url: 'https://target.com/instant-pot-duo',
    price: 89.95,
    currency: 'USD',
    store: 'Target',
    quantity: 1,
    isPurchased: false,
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Handmade Ceramic Mug',
    description: 'Supporting a local artist',
    quantity: 1,
    isPurchased: false,
    priority: 'low',
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const totalItems = computed(() => wishlistItems.value.length)
const purchasedItems = computed(() => wishlistItems.value.filter(item => item.isPurchased).length)
const pendingItems = computed(() => totalItems.value - purchasedItems.value)
const highPriorityPending = computed(() =>
  wishlistItems.value.filter(item => item.priority === 'high' && !item.isPurchased).length
)
const hasItems = computed(() => totalItems.value > 0)
const editingItem = computed(() =>
  editingItemId.value
    ? wishlistItems.value.find(item => item.id === editingItemId.value) ?? null
    : null
)

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

const addItem = (itemData: Omit<WishListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  const newItem: WishListItem = {
    id: Date.now().toString(),
    userId: 'user1',
    ...itemData,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  wishlistItems.value.push(newItem)
  showAddForm.value = false
}

const removeItem = (id: string) => {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== id)
  if (editingItemId.value === id) {
    editingItemId.value = null
  }
}

const editItem = (id: string) => {
  showAddForm.value = false
  editingItemId.value = id
}

const saveItemEdit = (updatedItem: WishListItem) => {
  const index = wishlistItems.value.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    wishlistItems.value[index] = updatedItem
  }
  editingItemId.value = null
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
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-4xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          My wishlist
        </p>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="space-y-3">
            <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
              Curate gifts you’ll love
            </h1>
            <p class="max-w-2xl text-base text-text-secondary md:text-lg">
              Keep your personal wishlist tidy, add inspiration quickly, and share context that helps your family gift with confidence.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="openAddForm"
          >
            Add item
          </button>
        </div>
      </section>

      <section class="grid gap-5 md:grid-cols-3">
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Total items</p>
          <p class="mt-3 text-3xl font-semibold tracking-tight">{{ totalItems }}</p>
          <p class="mt-1 text-xs text-text-secondary">
            {{ pendingItems }} active • {{ purchasedItems }} fulfilled
          </p>
        </div>
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">High priority</p>
          <p class="mt-3 text-3xl font-semibold tracking-tight">{{ highPriorityPending }}</p>
          <p class="mt-1 text-xs text-text-secondary">
            Items marked “Need soon”
          </p>
        </div>
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Status</p>
          <p class="mt-3 text-3xl font-semibold tracking-tight">
            {{
              totalItems
                ? Math.round((purchasedItems / totalItems) * 100)
                : 0
            }}%
          </p>
          <p class="mt-1 text-xs text-text-secondary">Completed</p>
        </div>
      </section>

      <section class="space-y-6">
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

      <section class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-text">Wishlist items</p>
            <p class="mt-1 text-xs text-text-secondary">
              Items are saved locally for now—perfect for shaping the experience before wiring up the API.
            </p>
          </div>
        </div>

        <div v-if="hasItems" class="mt-6 space-y-4">
          <Disclosure
            v-for="item in wishlistItems"
            :key="item.id"
            v-slot="{ open }"
            as="article"
            class="group rounded-2xl border border-border bg-surface-muted/40 px-3 py-2 shadow-sm shadow-black/10 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/15"
          >
            <div class="flex flex-col gap-3 rounded-xl px-3 py-3 transition duration-200 ease-soft-snap hover:bg-surface-muted/60">
              <div class="flex flex-wrap items-center gap-3">
                <DisclosureButton
                  class="flex flex-1 items-center justify-between gap-4 text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div class="flex flex-1 items-center gap-3">
                    <span class="flex-1 truncate">{{ item.title }}</span>
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
                  @click.stop
                >
                  <ExternalLink :size="12" :stroke-width="1.8" />
                  View
                </a>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-text-tertiary"
                    >
                      <ExternalLink :size="12" :stroke-width="1.8" />
                      No link
                    </span>
                  </div>
                  <ChevronDown
                    :class="[
                      'h-4 w-4 flex-shrink-0 text-text-tertiary transition duration-200 ease-soft-snap',
                      open ? 'rotate-180' : ''
                    ]"
                  />
                </DisclosureButton>

                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="priorityStyles[item.priority].class"
                >
                  <component
                    :is="priorityStyles[item.priority].icon"
                    :size="14"
                    :stroke-width="1.8"
                  />
                  {{ priorityStyles[item.priority].label }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
                  Qty {{ item.quantity }}
                </span>
              </div>
            </div>

            <Transition name="accordion">
              <DisclosurePanel
                class="space-y-4 rounded-xl border border-border bg-surface-muted/40 px-4 py-4 text-sm text-text-secondary"
              >
                <div class="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span
                    v-if="item.store"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Store :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    {{ item.store }}
                  </span>
                  <span
                    v-if="formatPrice(item)"
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Wallet :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    {{ formatPrice(item) }}
                  </span>
                  <span
                    class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold"
                  >
                    <Package :size="14" :stroke-width="1.8" class="text-text-tertiary" />
                    Quantity {{ item.quantity }}
                  </span>
                </div>

                <p v-if="item.description" class="text-sm text-text-secondary">
                  {{ item.description }}
                </p>

                <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
                  <div class="flex items-center gap-2">
                    <Clock :size="14" :stroke-width="1.8" />
                    Updated {{ formatUpdatedAt(item) }}
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-text"
                      @click="editItem(item.id)"
                    >
                      <Pencil :size="14" :stroke-width="1.8" />
                      Edit
                    </button>
                    <button
                      type="button"
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
          class="mt-6 space-y-4 rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center"
        >
          <h3 class="text-lg font-semibold text-text">Your wishlist is empty</h3>
          <p class="text-sm text-text-secondary">
            Add a few ideas so your family knows exactly what will make your day.
          </p>
          <button
            type="button"
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
