<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { User, WishListItem } from '@/types'
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
  HeartHandshake
} from 'lucide-vue-next'
import RoleBadge from '@/components/family/RoleBadge.vue'
import { generateAvatarDataUri } from '@/utils/avatar'

const route = useRoute()

const familyMembers = ref<User[]>([
  {
    id: 'mom',
    name: 'Mom',
    email: 'mom@family.com',
    avatar: '👩‍🦳',
    familyId: 'family1',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dad',
    name: 'Dad',
    email: 'dad@family.com',
    avatar: '👨‍🦲',
    familyId: 'family1',
    role: 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sister',
    name: 'Sarah',
    email: 'sarah@family.com',
    avatar: '👩‍🦱',
    familyId: 'family1',
    role: 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const mockWishlistItems = ref<Record<string, WishListItem[]>>({
  mom: [
    {
      id: '1',
      userId: 'mom',
      title: 'Instant Pot Duo',
      description: '7-in-1 Electric Pressure Cooker',
      url: 'https://target.com/instant-pot-duo',
      price: 89.95,
      currency: 'USD',
      store: 'Target',
      quantity: 1,
      isPurchased: false,
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      userId: 'mom',
      title: 'Yoga Mat',
      description: 'Non-slip exercise mat',
      url: 'https://rei.com/yoga-mat',
      price: 24.99,
      currency: 'USD',
      store: 'REI',
      quantity: 1,
      isPurchased: true,
      purchasedBy: 'dad',
      purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  dad: [
    {
      id: '3',
      userId: 'dad',
      title: 'Standing Desk Converter',
      description: 'Adjustable height desk riser',
      url: 'https://walmart.com/standing-desk',
      price: 199.0,
      currency: 'USD',
      store: 'Walmart',
      quantity: 1,
      isPurchased: false,
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  sister: [
    {
      id: '4',
      userId: 'sister',
      title: 'Mechanical Keyboard',
      description: 'Cherry MX Blue switches',
      url: 'https://bestbuy.com/mechanical-keyboard',
      price: 129.99,
      currency: 'USD',
      store: 'Best Buy',
      quantity: 1,
      isPurchased: false,
      priority: 'low',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      userId: 'sister',
      title: 'Watercolor Workshop',
      description: 'Local weekend class',
      quantity: 1,
      isPurchased: false,
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
})

const memberSummaries = computed(() =>
  familyMembers.value.map(member => {
    const items = mockWishlistItems.value[member.id] || []
    const purchased = items.filter(item => item.isPurchased).length
    return {
      member,
      items,
      totalItems: items.length,
      purchased,
      outstanding: items.length - purchased
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

const markAsPurchased = (memberId: string, itemId: string) => {
  const items = mockWishlistItems.value[memberId]
  const item = items?.find(current => current.id === itemId)
  if (item && !item.isPurchased) {
    item.isPurchased = true
    item.purchasedBy = 'current-user'
    item.purchasedAt = new Date()
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-5xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <section class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Family wishlists
        </p>
        <div class="space-y-3">
          <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
            Stay in sync with every wishlist
          </h1>
          <p class="max-w-2xl text-base text-text-secondary md:text-lg">
            Browse what each family member is collecting, spot priorities, and celebrate gifts that
            have already landed.
          </p>
        </div>
      </section>

      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Members</p>
              <p class="mt-3 text-3xl font-semibold tracking-tight">{{ totalMembers }}</p>
              <p class="mt-1 text-xs text-text-secondary">Everyone with access right now</p>
            </div>
            <div class="rounded-full bg-primary-soft p-3 text-primary">
              <Users :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Lists with items</p>
              <p class="mt-3 text-3xl font-semibold tracking-tight">{{ activeWishlists }}</p>
              <p class="mt-1 text-xs text-text-secondary">Members with at least one request</p>
            </div>
            <div class="rounded-full bg-primary-soft p-3 text-primary">
              <Gift :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Outstanding items</p>
              <p class="mt-3 text-3xl font-semibold tracking-tight">{{ outstandingItems }}</p>
              <p class="mt-1 text-xs text-text-secondary">
                Waiting for someone to pick up
              </p>
            </div>
            <div class="rounded-full bg-primary-soft p-3 text-primary">
              <Sparkles :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Purchased</p>
              <p class="mt-3 text-3xl font-semibold tracking-tight">{{ totalPurchasedItems }}</p>
              <p class="mt-1 text-xs text-text-secondary">Already taken care of</p>
            </div>
            <div class="rounded-full bg-primary-soft p-3 text-primary">
              <HeartHandshake :size="20" :stroke-width="1.8" />
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-text">Family members</p>
            <p class="mt-1 text-xs text-text-secondary">
              Click into any member to see their latest wishlist items.
            </p>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <Disclosure
            v-for="summary in memberSummaries"
            :key="summary.member.id"
            v-slot="{ open }"
            :default-open="highlightedMemberId === summary.member.id"
            as="article"
            class="group rounded-2xl border border-border bg-surface-muted/40 px-3 py-2 shadow-sm shadow-black/10 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/15"
            :class="[
              highlightedMemberId === summary.member.id ? 'border-primary shadow-md shadow-primary/15' : ''
            ]"
          >
            <div class="flex flex-col gap-3 rounded-xl px-3 py-3 transition duration-200 ease-soft-snap hover:bg-surface-muted/60">
              <div class="flex flex-wrap items-center gap-3">
                <DisclosureButton
                  class="flex flex-1 items-center justify-between gap-4 text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div class="flex flex-1 items-center gap-3">
                    <span class="flex items-center gap-2 text-lg font-semibold text-text">
                      <span class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-base text-primary">
                        <img
                          :src="generatedAvatars[summary.member.id]"
                          :alt="`${summary.member.name} avatar`"
                          class="h-full w-full object-cover"
                        />
                      </span>
                      <span>{{ summary.member.name }}</span>
                    </span>
                    <span
                      class="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                    >
                      {{ summary.totalItems }} items
                    </span>
                    <RoleBadge :role="summary.member.role" size="small" />
                    <a
                      v-if="summary.items.length"
                      :href="`/family?member=${summary.member.id}`"
                      class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
                      @click.stop
                    >
                      <ExternalLink :size="12" :stroke-width="1.8" />
                      Share
                    </a>
                  </div>
                  <ChevronDown
                    :class="[
                      'h-4 w-4 flex-shrink-0 text-text-tertiary transition duration-200 ease-soft-snap',
                      open ? 'rotate-180' : ''
                    ]"
                  />
                </DisclosureButton>

                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                  >
                    Outstanding {{ summary.outstanding }}
                  </span>
                  <span
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
                class="space-y-4 rounded-xl border border-border bg-surface-muted/40 px-4 py-4 text-sm text-text-secondary"
              >
                <div
                  v-if="summary.items.length"
                  class="grid gap-4 md:grid-cols-2"
                >
                  <div
                    v-for="item in summary.items"
                    :key="item.id"
                    class="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-sm shadow-black/10"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="text-sm font-semibold text-text">
                            {{ item.title }}
                          </h3>
                          <span
                            v-if="item.isPurchased"
                            class="inline-flex items-center gap-1 rounded-full border border-success-soft bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success"
                          >
                            <Check :size="12" :stroke-width="1.8" />
                            Purchased
                          </span>
                          <span
                            v-else
                            class="inline-flex items-center gap-1 rounded-full border border-primary-soft bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary"
                          >
                            {{ item.priority.charAt(0).toUpperCase() + item.priority.slice(1) }} priority
                          </span>
                        </div>
                        <p v-if="item.description" class="mt-1 text-xs text-text-secondary">
                          {{ item.description }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold">
                        <Package :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        Qty {{ item.quantity }}
                      </span>
                      <span
                        v-if="item.store"
                        class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold"
                      >
                        <Store :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        {{ item.store }}
                      </span>
                      <span
                        v-if="formatPrice(item)"
                        class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 font-semibold"
                      >
                        <Wallet :size="12" :stroke-width="1.8" class="text-text-tertiary" />
                        {{ formatPrice(item) }}
                      </span>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-text-tertiary">
                      <div class="inline-flex items-center gap-2">
                        <Clock :size="12" :stroke-width="1.8" />
                        Updated {{ formatUpdatedAt(item) }}
                      </div>
                      <div class="flex items-center gap-2">
                        <a
                          v-if="item.url"
                          :href="item.url"
                          target="_blank"
                          rel="noopener"
                          class="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover"
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
                        <button
                          v-if="!item.isPurchased"
                          type="button"
                          class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-primary hover:text-primary"
                          @click="markAsPurchased(summary.member.id, item.id)"
                        >
                          Mark purchased
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else
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
  </div>
</template>
