<script setup lang="ts">
import { ref } from 'vue'
import type { WishListItem } from '@/types'
import EditItemForm from '@/components/EditItemForm.vue'
import AddItemForm from '@/components/AddItemForm.vue'

const showAddForm = ref(false)
const editingItemId = ref<string | null>(null)

const mockWishlistItems = ref<WishListItem[]>([
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

const addItem = (itemData: Omit<WishListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  const newItem: WishListItem = {
    id: Date.now().toString(),
    userId: 'user1',
    ...itemData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  mockWishlistItems.value.push(newItem)
  showAddForm.value = false
}

const removeItem = (id: string) => {
  mockWishlistItems.value = mockWishlistItems.value.filter(item => item.id !== id)
}

const editItem = (id: string) => {
  editingItemId.value = id
  showAddForm.value = false
}

const saveItemEdit = (updatedItem: WishListItem) => {
  const index = mockWishlistItems.value.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    mockWishlistItems.value[index] = updatedItem
  }
  editingItemId.value = null
}

const cancelEdit = () => {
  editingItemId.value = null
}

const cancelAdd = () => {
  showAddForm.value = false
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
  <div class="my-wishlist">
    <div class="header">
      <h1>My Wishlist</h1>
      <button @click="showAddForm = true" class="add-btn">+ Add Item</button>
    </div>

    <!-- Add Form -->
    <AddItemForm
      v-if="showAddForm"
      @save="addItem"
      @cancel="cancelAdd"
    />

    <!-- Edit Form -->
    <EditItemForm
      v-if="editingItemId"
      :item="mockWishlistItems.find(item => item.id === editingItemId)!"
      @save="saveItemEdit"
      @cancel="cancelEdit"
    />

    <div class="wishlist-items">
      <div v-for="item in mockWishlistItems" :key="item.id" class="item-card" :class="{ editing: editingItemId === item.id }">
        <div class="item-details">
          <div class="item-header">
            <h3>{{ item.title }}</h3>
            <div 
              class="priority-badge" 
              :style="{ backgroundColor: getPriorityColor(item.priority) }"
            >
              {{ item.priority }}
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
            <button @click="editItem(item.id)" class="edit-btn">Edit</button>
            <button @click="removeItem(item.id)" class="remove-btn">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mockWishlistItems.length === 0" class="empty-state">
      <h3>Your wishlist is empty</h3>
      <p>Add some items you'd love to receive as gifts!</p>
      <button @click="showAddForm = true" class="add-btn">Add Your First Item</button>
    </div>
  </div>
</template>

<style scoped>
.my-wishlist {
  max-width: 1000px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.add-btn {
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

.add-btn:hover {
  background: var(--color-primary-hover);
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

.item-card.editing {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  opacity: 0.6;
}

.item-details {
  width: 100%;
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
  word-break: break-word;
  line-height: 1.3;
  color: var(--color-text);
  font-size: 18px;
}

.priority-badge {
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
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
  flex-wrap: wrap;
  gap: var(--spacing-sm);
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

.edit-btn {
  background: var(--color-warning);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-btn:hover {
  background: #e64a19;
}

.remove-btn {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--color-error);
  color: white;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: var(--color-text-secondary);
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
    align-items: stretch;
  }

  .priority-badge {
    align-self: flex-start;
  }

  .item-actions > * {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .item-header h3 {
    font-size: 16px;
  }

  .item-actions {
    flex-direction: column;
  }

  .item-actions > * {
    width: 100%;
  }
}
</style>
