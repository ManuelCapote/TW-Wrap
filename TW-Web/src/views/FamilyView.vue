<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import type { WishListItem } from '@/types'
import { useFamilyStore } from '@/stores/family'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { Disclosure, DisclosureButton, DisclosurePanel, TransitionRoot } from '@headlessui/vue'
import {
  Users,
  Gift,
  Sparkles,
  ExternalLink,
  Check,
  Package,
  Store,
  Wallet,
  Clock,
  ChevronDown,
  HeartHandshake,
  Plus
} from 'lucide-vue-next'
import RoleBadge from '@/components/family/RoleBadge.vue'
import { generateAvatarDataUri } from '@/utils/avatar'

const route = useRoute()
const familyStore = useFamilyStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

// Filter state
const itemFilter = ref<'all' | 'available' | 'purchased'>('all')

// Use store data instead of mock data
const familyMembers = computed(() => familyStore.members)
const isLoading = computed(() => familyStore.isLoading || wishlistStore.isLoading)

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      familyStore.fetchFamilyMembers(),
      wishlistStore.fetchFamilyWishlists()
    ])
  } catch (error) {
    console.error('Failed to load family data:', error)
  }
})

// Get wishlist items organized by user ID
const mockWishlistItems = computed(() => {
  const items: Record<string, WishListItem[]> = {}
  wishlistStore.familyWishlists.forEach(wishlist => {
    items[wishlist.userId] = wishlist.items
  })
  return items
})

const memberSummaries = computed(() =>
  familyMembers.value.map(member => {
    const allItems = mockWishlistItems.value[member.id] || []

    // Filter items based on selected filter
    let items = allItems
    if (itemFilter.value === 'available') {
      items = allItems.filter(item => !item.isPurchased)
    } else if (itemFilter.value === 'purchased') {
      items = allItems.filter(item => item.isPurchased)
    }

    const purchased = allItems.filter(item => item.isPurchased).length
    return {
      member,
      items,
      totalItems: allItems.length,
      purchased,
      outstanding: allItems.length - purchased
    }
  })
)

const totalMembers = computed(() => familyMembers.value.length)

const totalWishlistItems = computed(() =>
  Object.values(mockWishlistItems.value).reduce((sum, list) => sum + list.length, 0)
)

const totalPurchasedItems = computed(() =>
  Object.values(mockWishlistItems.value).reduce(
    (sum, list) => sum + list.filter(item => item.isPurchased).length,
    0
  )
)

const outstandingItems = computed(() => totalWishlistItems.value - totalPurchasedItems.value)
const activeWishlists = computed(() => memberSummaries.value.filter(summary => summary.totalItems > 0).length)

const highlightedMemberId = computed(() => (route.query.member as string) || '')

const generatedAvatars = computed(() => {
  const map: Record<string, string> = {}
  familyMembers.value.forEach(member => {
    const seed = member.email || member.id
    map[member.id] = generateAvatarDataUri(seed)
  })
  return map
})

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

const markAsPurchased = async (memberId: string, itemId: string) => {
  try {
    await wishlistStore.markAsPurchased(itemId, memberId)
    success('Item marked as purchased!')
  } catch (error) {
    console.error('Failed to mark item as purchased:', error)
    showError('Failed to mark item as purchased')
  }
}
</script>

<template>
  <div data-role="page-container" class="min-h-screen bg-background text-text">
    <div data-role="content-wrapper" class="mx-auto max-w-5xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section data-role="section" data-section-type="hero" class="space-y-4">
        <p data-role="eyebrow-label" class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Family wishlists
        </p>
        <div class="space-y-3">
          <h1 data-role="page-title" class="text-4xl font-semibold tracking-tight md:text-5xl">
            Stay in sync with every wishlist
          </h1>
          <p data-role="page-description" class="max-w-2xl text-base text-text-secondary md:text-lg">
            Browse what each family member is collecting, spot priorities, and celebrate gifts that
            have already landed.
          </p>
        </div>
      </section>

      <section data-role="grid" data-grid-type="stats" class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div data-role="stat-card" data-stat-type="members" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Members</p>
              <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ totalMembers }}</p>
              <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">Everyone with access right now</p>
            </div>
            <div data-role="stat-icon" class="rounded-full bg-primary-soft p-3 text-primary">
              <Users :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div data-role="stat-card" data-stat-type="active-lists" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Lists with items</p>
              <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ activeWishlists }}</p>
              <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">Members with at least one request</p>
            </div>
            <div data-role="stat-icon" class="rounded-full bg-primary-soft p-3 text-primary">
              <Gift :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div data-role="stat-card" data-stat-type="outstanding" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Outstanding items</p>
              <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ outstandingItems }}</p>
              <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">
                Waiting for someone to pick up
              </p>
            </div>
            <div data-role="stat-icon" class="rounded-full bg-primary-soft p-3 text-primary">
              <Sparkles :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div data-role="stat-card" data-stat-type="purchased" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p data-role="stat-label" class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Purchased</p>
              <p data-role="stat-value" class="mt-3 text-3xl font-semibold tracking-tight">{{ totalPurchasedItems }}</p>
              <p data-role="stat-description" class="mt-1 text-xs text-text-secondary">Already taken care of</p>
            </div>
            <div data-role="stat-icon" class="rounded-full bg-primary-soft p-3 text-primary">
              <HeartHandshake :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
      </section>

      <section data-role="section" data-section-type="members-wishlists" class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div data-role="section-header" class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div data-role="header-content">
            <p data-role="section-title" class="text-sm font-semibold text-text">Family members</p>
            <p data-role="section-description" class="mt-1 text-xs text-text-secondary">
              Click into any member to see their latest wishlist items.
            </p>
          </div>

          <!-- Filter buttons -->
          <div data-role="filter-group" class="flex items-center gap-1 rounded-full border border-border bg-surface-muted/60 p-1">
            <button
              type="button"
              data-filter="all"
              :data-active="itemFilter === 'all'"
              class="rounded-full px-3 py-1.5 text-xs font-semibold transition duration-150 ease-soft-snap"
              :class="itemFilter === 'all' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-text-secondary hover:text-text'"
              @click="itemFilter = 'all'"
            >
              All Items
            </button>
            <button
              type="button"
              data-filter="available"
              :data-active="itemFilter === 'available'"
              class="rounded-full px-3 py-1.5 text-xs font-semibold transition duration-150 ease-soft-snap"
              :class="itemFilter === 'available' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-text-secondary hover:text-text'"
              @click="itemFilter = 'available'"
            >
              Available
            </button>
            <button
              type="button"
              data-filter="purchased"
              :data-active="itemFilter === 'purchased'"
              class="rounded-full px-3 py-1.5 text-xs font-semibold transition duration-150 ease-soft-snap"
              :class="itemFilter === 'purchased' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-text-secondary hover:text-text'"
              @click="itemFilter = 'purchased'"
            >
              Purchased
            </button>
          </div>
        </div>

        <div data-role="list" data-list-type="member-disclosures" class="mt-6 space-y-4">
          <!-- @ts-ignore HeadlessUI slot types -->
          <Disclosure
            v-for="summary in memberSummaries"
            :key="summary.member.id"
            v-slot="{ open }: { open: boolean }"
            :default-open="highlightedMemberId === summary.member.id"
            as="article"
            data-role="disclosure"
            data-disclosure-type="member"
            :data-member-id="summary.member.id"
            :data-state="open ? 'open' : 'closed'"
            class="group rounded-2xl border border-border bg-surface-muted/40 px-3 py-2 shadow-sm shadow-black/10 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/15"
            :class="[
              highlightedMemberId === summary.member.id ? 'border-primary shadow-md shadow-primary/15' : ''
            ]"
          >
            <div data-role="disclosure-header" class="flex flex-col gap-3 rounded-xl px-3 py-3 transition duration-200 ease-soft-snap hover:bg-surface-muted/60">
              <div class="flex flex-wrap items-center gap-3">
                <DisclosureButton
                  data-role="disclosure-trigger"
                  class="flex flex-1 items-center justify-between gap-4 text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div data-role="member-info" class="flex flex-1 items-center gap-3">
                    <span class="flex items-center gap-2 text-lg font-semibold text-text">
                      <span data-role="avatar" class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-base text-primary">
                        <img
                          :src="generatedAvatars[summary.member.id]"
                          :alt="`${summary.member.name} avatar`"
                          class="h-full w-full object-cover"
                        />
                      </span>
                      <span data-role="member-name">{{ summary.member.name }}</span>
                    </span>
                    <span
                      data-role="badge"
                      data-badge-type="count"
                      class="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                    >
                      {{ summary.totalItems }} items
                    </span>
                    <RoleBadge :role="summary.member.role" size="small" />
                    <a
                      v-if="summary.items.length"
                      :href="`/family?member=${summary.member.id}`"
                      data-role="button"
                      data-action="share"
                      class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
                      @click.stop
                    >
                      <ExternalLink :size="12" :stroke-width="1.8" />
                      Share
                    </a>
                  </div>
                  <ChevronDown
                    data-role="disclosure-icon"
                    :class="[
                      'h-4 w-4 flex-shrink-0 text-text-tertiary transition duration-200 ease-soft-snap',
                      open ? 'rotate-180' : ''
                    ]"
                  />
                </DisclosureButton>

                <div data-role="badge-group" class="flex flex-wrap items-center gap-2">
                  <span
                    data-role="badge"
                    data-badge-type="status"
                    data-status-type="outstanding"
                    class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                  >
                    Outstanding {{ summary.outstanding }}
                  </span>
                  <span
                    data-role="badge"
                    data-badge-type="status"
                    data-status-type="purchased"
                    class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                  >
                    Purchased {{ summary.purchased }}
                  </span>
                </div>
              </div>
            </div>

            <TransitionRoot
              as="template"
              enter="transition duration-150 ease-out"
              enter-from="transform scale-95 opacity-0"
              enter-to="transform scale-100 opacity-100"
              leave="transition duration-100 ease-in"
              leave-from="transform scale-100 opacity-100"
              leave-to="transform scale-95 opacity-0"
            >
              <DisclosurePanel
                data-role="disclosure-panel"
                class="space-y-4 rounded-xl border border-border bg-surface-muted/40 px-4 py-4 text-sm text-text-secondary"
              >
                <div
                  v-if="summary.items.length"
                  data-role="grid"
                  data-grid-type="items"
                  class="grid gap-4 md:grid-cols-2"
                >
                  <div
                    v-for="item in summary.items"
                    :key="item.id"
                    data-role="item-card"
                    :data-item-id="item.id"
                    :data-priority="item.priority"
                    :data-purchased="item.isPurchased"
                    :data-purchased-by-me="item.isPurchased && item.purchasedBy === authStore.user?.id"
                    class="flex flex-col gap-3 rounded-xl border px-4 py-4 shadow-sm shadow-black/10 transition duration-200"
                    :class="item.isPurchased ? 'border-success/40 bg-success-soft/20 opacity-75' : 'border-border bg-background hover:border-primary/40'"
                  >
                    <div data-role="item-header" class="flex items-start justify-between gap-3">
                      <div data-role="item-content">
                        <div data-role="item-title-row" class="flex items-center gap-2">
                          <h3 data-role="item-title" class="text-sm font-semibold text-text">
                            {{ item.title }}
                          </h3>
                          <span
                            v-if="item.isPurchased && item.purchasedBy === authStore.user?.id"
                            data-role="badge"
                            data-badge-type="status"
                            data-badge-variant="success-you"
                            class="inline-flex items-center gap-1 rounded-full border border-success bg-success px-2 py-0.5 text-[11px] font-semibold text-white"
                          >
                            <Check :size="12" :stroke-width="1.8" />
                            Purchased by You
                          </span>
                          <span
                            v-else-if="item.isPurchased"
                            data-role="badge"
                            data-badge-type="status"
                            data-badge-variant="success"
                            class="inline-flex items-center gap-1 rounded-full border border-success-soft bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success"
                          >
                            <Check :size="12" :stroke-width="1.8" />
                            Purchased
                          </span>
                          <span
                            v-else
                            data-role="badge"
                            data-badge-type="priority"
                            :data-priority="item.priority"
                            class="inline-flex items-center gap-1 rounded-full border border-primary-soft bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary"
                          >
                            {{ item.priority.charAt(0).toUpperCase() + item.priority.slice(1) }} priority
                          </span>
                        </div>
                        <p v-if="item.description" data-role="item-description" class="mt-1 text-xs text-text-secondary">
                          {{ item.description }}
                        </p>
                      </div>
                    </div>

                    <div data-role="item-metadata" class="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span data-role="badge" data-badge-type="quantity" class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold">
                        <Package :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        Qty {{ item.quantity }}
                      </span>
                      <span
                        v-if="item.store"
                        data-role="badge"
                        data-badge-type="store"
                        class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold"
                      >
                        <Store :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        {{ item.store }}
                      </span>
                      <span
                        v-if="formatPrice(item)"
                        data-role="badge"
                        data-badge-type="price"
                        class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold"
                      >
                        <Wallet :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        {{ formatPrice(item) }}
                      </span>
                    </div>

                    <div data-role="item-actions" class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
                      <div data-role="item-timestamp" class="inline-flex items-center gap-2">
                        <Clock :size="12" :stroke-width="1.8" />
                        Updated {{ formatUpdatedAt(item) }}
                      </div>
                      <div data-role="action-buttons" class="flex items-center gap-2">
                        <a
                          v-if="item.url"
                          :href="item.url"
                          target="_blank"
                          rel="noopener"
                          data-role="button"
                          data-action="view-external"
                          class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
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
                        <button
                          v-if="!item.isPurchased"
                          type="button"
                          data-role="button"
                          data-action="mark-purchased"
                          class="inline-flex items-center gap-2 rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-success/90"
                          @click="markAsPurchased(summary.member.id, item.id)"
                        >
                          <Check :size="14" :stroke-width="1.8" />
                          Mark as Purchased
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  data-role="empty-state"
                  data-empty-type="no-items"
                  class="rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-text-secondary"
                >
                  Nothing on this list yet. Encourage {{ summary.member.name }} to add a few ideas.
                </div>
              </DisclosurePanel>
            </TransitionRoot>
          </Disclosure>
        </div>
      </section>
    </div>

    <!-- Floating Quick Add Button - Links to My Wishlist -->
    <RouterLink
      to="/my-wishlist"
      data-role="button"
      data-action="quick-add"
      class="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition duration-200 ease-soft-snap hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:px-6 md:py-4"
    >
      <Plus :size="20" :stroke-width="2" />
      <span class="hidden sm:inline">Add to My List</span>
    </RouterLink>
  </div>
</template>
