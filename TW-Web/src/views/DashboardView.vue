<script setup lang="ts">
import { Palette, BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="dashboard">
    <h1>Family Wish Lists Dashboard</h1>
    <p class="subtitle">See what everyone in your family is wishing for</p>

    <div class="family-wishlists">
      <RouterLink to="/family?member=mom" class="wishlist-card-link">
        <div class="wishlist-card">
          <h3>Mom's Wishlist</h3>
          <p>3 items</p>
          <div class="recent-items">
            <div class="item-preview">
              <span class="item-name">
                <Palette :size="16" :stroke-width="2" class="item-icon" />
                Art Supplies Set
              </span>
              <span class="price">$45.99</span>
            </div>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/family?member=dad" class="wishlist-card-link">
        <div class="wishlist-card">
          <h3>Dad's Wishlist</h3>
          <p>5 items</p>
          <div class="recent-items">
            <div class="item-preview">
              <span class="item-name">
                <BookOpen :size="16" :stroke-width="2" class="item-icon" />
                Programming Book
              </span>
              <span class="price">$29.99</span>
            </div>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/my-wishlist" class="wishlist-card-link">
        <div class="wishlist-card">
          <h3>Your Wishlist</h3>
          <p>2 items</p>
          <div class="card-footer">
            <span class="manage-link">Manage →</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.dashboard h1 {
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: 15px;
}

.family-wishlists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.wishlist-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.wishlist-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  height: 100%;
  cursor: pointer;
}

.wishlist-card-link:hover .wishlist-card {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.wishlist-card h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
  font-size: 18px;
}

.wishlist-card p {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.recent-items {
  margin-top: var(--spacing-md);
}

.item-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.price {
  font-weight: 600;
  color: var(--color-primary);
}

.card-footer {
  margin-top: var(--spacing-md);
}

.manage-link {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 14px;
  }

  .family-wishlists {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .dashboard h1 {
    font-size: 1.3rem;
  }

  .wishlist-card h3 {
    font-size: 16px;
  }
}
</style>
