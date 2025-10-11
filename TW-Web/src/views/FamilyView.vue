<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { User, WishListItem } from '@/types'

const route = useRoute()

const familyMembers = ref<User[]>([
  {
    id: 'mom',
    name: 'Mom',
    email: 'mom@family.com',
    avatar: '👩‍🦳',
    familyId: 'family1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dad',
    name: 'Dad',
    email: 'dad@family.com',
    avatar: '👨‍🦲',
    familyId: 'family1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sister',
    name: 'Sarah',
    email: 'sarah@family.com',
    avatar: '👩‍🦱',
    familyId: 'family1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const selectedMember = ref<string>('')

// Auto-select member from query parameter
onMounted(() => {
  const memberParam = route.query.member as string
  if (memberParam && familyMembers.value.some(m => m.id === memberParam)) {
    selectedMember.value = memberParam
  }
})

const mockWishlistItems: Record<string, WishListItem[]> = {
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
      price: 199.00,
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
}

const markAsPurchased = (memberId: string, itemId: string) => {
  const items = mockWishlistItems[memberId]
  const item = items?.find(item => item.id === itemId)
  if (item) {
    item.isPurchased = true
    item.purchasedBy = 'current-user'
    item.purchasedAt = new Date()
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#e74c3c'
    case 'medium': return '#f39c12'
    case 'low': return '#27ae60'
    default: return '#95a5a6'
  }
}
</script>

<template>
  <div class="family-view">
    <h1>Family Wishlists</h1>
    <p class="subtitle">See what your family members are wishing for</p>

    <div class="family-members">
      <div 
        v-for="member in familyMembers" 
        :key="member.id"
        class="member-card"
        :class="{ active: selectedMember === member.id }"
        @click="selectedMember = selectedMember === member.id ? '' : member.id"
      >
        <div class="member-avatar">{{ member.avatar }}</div>
        <div class="member-info">
          <h3>{{ member.name }}</h3>
          <p>{{ mockWishlistItems[member.id]?.length || 0 }} items</p>
        </div>
        <div class="expand-arrow">{{ selectedMember === member.id ? '▼' : '▶' }}</div>
      </div>
    </div>

    <div v-if="selectedMember" class="member-wishlist">
      <h2>{{ familyMembers.find(m => m.id === selectedMember)?.name }}'s Wishlist</h2>
      
      <div class="wishlist-items">
        <div 
          v-for="item in mockWishlistItems[selectedMember]" 
          :key="item.id" 
          class="item-card"
          :class="{ purchased: item.isPurchased }"
        >
          <div class="item-details">
            <div class="item-header">
              <h3>{{ item.title }}</h3>
              <div class="header-badges">
                <div v-if="item.isPurchased" class="purchased-badge">✓ Purchased</div>
                <div 
                  class="priority-badge" 
                  :style="{ backgroundColor: getPriorityColor(item.priority) }"
                >
                  {{ item.priority }}
                </div>
              </div>
            </div>
            
            <div class="item-meta">
              <span v-if="item.store" class="store">{{ item.store }}</span>
            </div>
            
            <div class="item-actions">
              <a 
                v-if="item.url" 
                :href="item.url" 
                target="_blank" 
                rel="noopener" 
                class="view-btn"
              >
                View Product
              </a>
              <span v-else class="no-link-badge">No link provided</span>
              <button 
                v-if="!item.isPurchased"
                @click="markAsPurchased(selectedMember, item.id)" 
                class="purchase-btn"
              >
                Mark as Purchased
              </button>
              <span v-else class="purchased-text">
                Purchased by {{ item.purchasedBy === 'current-user' ? 'you' : item.purchasedBy }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!mockWishlistItems[selectedMember]?.length" class="empty-wishlist">
        <p>{{ familyMembers.find(m => m.id === selectedMember)?.name }} hasn't added any items yet.</p>
      </div>
    </div>

    <div v-if="!selectedMember" class="no-selection">
      <p>Select a family member to view their wishlist</p>
    </div>
  </div>
</template>

<style scoped>
.family-view {
  max-width: 1000px;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: 15px;
}

.family-members {
  display: grid;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.member-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.member-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.member-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  box-shadow: var(--shadow-md);
}

.member-avatar {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border-radius: 50%;
  border: 2px solid var(--color-border);
}

.member-info {
  flex: 1;
}

.member-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text);
  font-size: 18px;
}

.member-info p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.expand-arrow {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: bold;
}

.member-wishlist h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text);
}

.wishlist-items {
  display: grid;
  gap: var(--spacing-lg);
}

.item-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.item-card:hover {
  box-shadow: var(--shadow-md);
}

.item-card.purchased {
  opacity: 0.7;
  background: var(--color-surface);
}

.item-details {
  width: 100%;
}

.header-badges {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.purchased-badge {
  background: var(--color-success);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.item-header h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 18px;
  line-height: 1.3;
}

.priority-badge {
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.store {
  color: var(--color-text-secondary);
  font-size: 14px;
  background: var(--color-surface);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.item-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.no-link-badge {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  background: var(--color-background);
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
}

.view-btn {
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  display: inline-block;
}

.view-btn:hover {
  background: var(--color-primary-hover);
  text-decoration: none;
}

.purchase-btn {
  background: var(--color-success);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.purchase-btn:hover {
  background: #2e7d32;
}

.purchased-text {
  color: var(--color-success);
  font-weight: 600;
  font-size: 14px;
}

.empty-wishlist, .no-selection {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: var(--color-text-secondary);
}

.empty-wishlist p, .no-selection p {
  margin: 0;
  font-size: 15px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .subtitle {
    font-size: 14px;
  }

  .member-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .member-wishlist h2 {
    font-size: 1.3rem;
  }

  .item-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-badges {
    align-self: flex-start;
  }

  .item-header h3 {
    font-size: 16px;
  }

  .item-actions > * {
    flex: 1;
    text-align: center;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .family-view h1 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 13px;
  }

  .member-avatar {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .member-wishlist h2 {
    font-size: 1.2rem;
  }

  .item-header h3 {
    font-size: 15px;
  }

  .item-actions {
    flex-direction: column;
  }

  .item-actions > * {
    width: 100%;
    min-width: 0;
  }
}
</style>
