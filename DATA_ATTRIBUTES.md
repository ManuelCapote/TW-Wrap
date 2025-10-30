# Data Attributes Guide

This document provides a comprehensive reference for the semantic data attributes used throughout the TW Wrap Vue application. These attributes follow the **Option 4: Data Attributes (Semantic Hooks)** naming convention, which separates structure and purpose from styling.

## Table of Contents

- [Overview](#overview)
- [Naming Convention](#naming-convention)
- [Attribute Hierarchy](#attribute-hierarchy)
- [Complete Attribute Reference](#complete-attribute-reference)
- [Component Patterns](#component-patterns)
- [Implementation Examples](#implementation-examples)
- [Testing & Automation](#testing--automation)

---

## Overview

### Why Data Attributes?

Data attributes provide semantic meaning to HTML elements without affecting styling. This approach:

- **Separates concerns**: Structure/purpose vs. visual styling
- **Improves testability**: Easy to target elements in E2E tests (Playwright, Cypress)
- **Enhances readability**: Self-documenting HTML structure
- **Maintains flexibility**: Tailwind utility classes remain unchanged
- **Supports automation**: Reliable selectors for scraping and testing

### Key Principles

1. **Primary attribute**: `data-role` identifies the semantic purpose
2. **Type specifiers**: `data-{context}-type` specifies variants within a role
3. **Unique identifiers**: `data-{context}-id` for data-driven elements
4. **State attributes**: `data-state`, `data-loading`, etc. for dynamic states
5. **Keep styling separate**: Data attributes describe **what**, not **how**

---

## Naming Convention

### Hierarchy Pattern

```
data-role → data-[role]-type → data-[specific-identifier]
```

### Examples

```html
<!-- Simple hierarchy -->
<div data-role="card">...</div>

<!-- With type -->
<div data-role="card" data-card-type="stat">...</div>

<!-- With specific identifier -->
<div data-role="stat-card" data-stat-type="members">...</div>

<!-- With data identifier -->
<li data-role="list-item" data-item-type="member" data-member-id="123">...</li>
```

### Naming Rules

1. **Use kebab-case**: `data-role="page-container"` ✓ not `data-role="pageContainer"` ✗
2. **Be descriptive**: `data-role="disclosure-trigger"` ✓ not `data-role="btn"` ✗
3. **Context-specific**: `data-member-id` for members, `data-item-id` for items
4. **Boolean values**: `"true"` or `"false"` as strings, or use attribute presence
5. **State values**: `"open"`, `"closed"`, `"loading"`, `"error"`, etc.

---

## Attribute Hierarchy

### Level 1: Container & Layout

Top-level structural elements that define page layout.

```html
<div data-role="page-container">
  <div data-role="content-wrapper">
    <section data-role="section" data-section-type="hero">...</section>
    <section data-role="grid" data-grid-type="stats">...</section>
  </div>
</div>
```

### Level 2: Components

Semantic components and their primary elements.

```html
<div data-role="card" data-card-type="stat">
  <div data-role="card-header">...</div>
  <div data-role="card-content">...</div>
</div>
```

### Level 3: Interactive Elements

Buttons, links, form inputs, and interactive components.

```html
<button data-role="button" data-action="submit" data-loading="false">
  Submit
</button>
```

### Level 4: Data Items

Dynamic, data-driven elements with unique identifiers.

```html
<li data-role="list-item"
    data-item-type="member"
    data-member-id="abc123">
  ...
</li>
```

---

## Complete Attribute Reference

### Page Structure

| Attribute | Values | Description | Example |
|-----------|--------|-------------|---------|
| `data-role="page-container"` | - | Main page wrapper | `<div data-role="page-container">` |
| `data-role="content-wrapper"` | - | Inner content container (max-width) | `<div data-role="content-wrapper">` |
| `data-role="section"` | - | Major page section | `<section data-role="section">` |
| `data-section-type` | `hero`, `stats`, `list`, `form`, `members-list`, `members-wishlists` | Section purpose | `data-section-type="hero"` |

### Hero Section

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-role="eyebrow-label"` | Small label above title | `<p data-role="eyebrow-label">Dashboard</p>` |
| `data-role="page-title"` | Main page heading | `<h1 data-role="page-title">Welcome</h1>` |
| `data-role="page-description"` | Page description text | `<p data-role="page-description">...</p>` |

### Grids & Lists

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="grid"` | - | Grid layout container |
| `data-grid-type` | `stats`, `members`, `items` | Grid content type |
| `data-role="list"` | - | List container |
| `data-list-type` | `members`, `items`, `invites`, `stats`, `member-disclosures` | List content type |
| `data-role="list-item"` | - | Individual list item |
| `data-item-type` | `member`, `wishlist-item`, `invite-code`, `stat-row` | Item type |

### Cards

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="card"` | - | Card container |
| `data-card-type` | `stat`, `family-info`, `quick-links`, `member`, `item`, `info`, `action` | Card purpose |
| `data-role="card-header"` | - | Card header section |
| `data-role="card-content"` | - | Card main content |
| `data-role="card-title"` | - | Card title text |
| `data-role="card-description"` | - | Card description text |
| `data-role="card-label"` | - | Card category label |

### Stat Cards

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="stat-card"` | - | Stat display card |
| `data-stat-type` | `members`, `admins`, `regular-members`, `created-date`, `active-lists`, `outstanding`, `purchased`, `total-items`, `high-priority`, `completion` | Stat category |
| `data-role="stat-icon"` | - | Icon container |
| `data-role="stat-label"` | - | Stat label text |
| `data-role="stat-value"` | - | Stat numeric value |
| `data-role="stat-description"` | - | Stat description text |
| `data-role="stats-list"` | - | List of stat rows |
| `data-role="stat-row"` | - | Individual stat row (in dl elements) |

### Disclosure / Accordion

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="disclosure"` | - | Expandable/collapsible section |
| `data-disclosure-type` | `member`, `item` | Content type |
| `data-state` | `open`, `closed` | Current expanded state |
| `data-role="disclosure-trigger"` | - | Button to expand/collapse |
| `data-role="disclosure-header"` | - | Header section of disclosure |
| `data-role="disclosure-panel"` | - | Expandable content panel |
| `data-role="disclosure-icon"` | - | Chevron/arrow icon |

### Wishlist Items

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="item-card"` | - | Wishlist item card |
| `data-item-id` | string | Unique item ID |
| `data-priority` | `high`, `medium`, `low` | Item priority level |
| `data-purchased` | `true`, `false` | Purchase status |
| `data-role="item-header"` | - | Item header section |
| `data-role="item-content"` | - | Item main content |
| `data-role="item-title-row"` | - | Row with title and badges |
| `data-role="item-title"` | - | Item title text |
| `data-role="item-description"` | - | Item description text |
| `data-role="item-metadata"` | - | Metadata container (qty, store, price) |
| `data-role="item-actions"` | - | Action buttons container |
| `data-role="item-timestamp"` | - | Last updated timestamp |

### Badges

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="badge"` | - | Badge/tag element |
| `data-badge-type` | `priority`, `role`, `status`, `count`, `date`, `quantity`, `store`, `price`, `no-link` | Badge purpose |
| `data-badge-variant` | `primary`, `success`, `warning`, `danger`, `neutral` | Visual style |
| `data-badge-size` | `small`, `medium` | Size variant |
| `data-priority` | `high`, `medium`, `low` | Priority level (for priority badges) |
| `data-role-type` | `admin`, `member` | Role type (for role badges) |
| `data-status-type` | `outstanding`, `purchased` | Status type (for status badges) |
| `data-role="badge-icon"` | - | Icon within badge |
| `data-role="badge-label"` | - | Text within badge |
| `data-role="badge-group"` | - | Container for multiple badges |

### Buttons & Actions

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="button"` | - | Button element |
| `data-action` | `submit`, `cancel`, `edit`, `delete`, `copy`, `close`, `manage-members`, `share`, `view-external`, `mark-purchased` | Button action |
| `data-loading` | `true`, `false` | Loading state |
| `data-button-style` | `primary`, `secondary`, `danger`, `ghost` | Visual variant |

### Quick Links

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="quick-link"` | - | Navigation link in quick links section |
| `data-link-type` | `settings`, `invite-codes`, `wishlists` | Link destination/purpose |
| `data-role="quick-links-list"` | - | Container for quick links |

### Members

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="member-card"` | - | Member card container |
| `data-member-id` | string | Unique member ID |
| `data-is-current-user` | `true`, `false` | Is current logged-in user |
| `data-role="member-info"` | - | Member information section |
| `data-role="member-name"` | - | Member name text |
| `data-role="member-email"` | - | Member email text |
| `data-role="member-metadata"` | - | Member metadata section |
| `data-role="avatar"` | - | Avatar image container |

### Forms

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="form-container"` | - | Form wrapper |
| `data-form-type` | `login`, `register`, `add-item`, `edit-item`, `join-family`, `invite-code` | Form purpose |
| `data-role="form-header"` | - | Form header section |
| `data-role="form"` | - | Actual form element |
| `data-role="form-group"` | - | Field group container |
| `data-role="form-label"` | - | Input label |
| `data-role="form-input"` | - | Input element |
| `data-role="form-error"` | - | Error message |
| `data-role="form-actions"` | - | Button container |
| `data-validation-state` | `valid`, `invalid`, `pristine` | Field validation state |

### Modals & Overlays

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="modal"` | - | Modal container |
| `data-modal-type` | `join-family`, `invite-code`, `confirmation` | Modal purpose |
| `data-role="modal-overlay"` | - | Backdrop overlay |
| `data-role="modal-panel"` | - | Content panel |
| `data-role="modal-header"` | - | Header section |
| `data-role="modal-body"` | - | Body section |
| `data-role="modal-footer"` | - | Footer/actions section |

### Alerts & Notifications

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="alert"` | - | Alert/notification banner |
| `data-alert-type` | `success`, `error`, `warning`, `info` | Alert level |
| `data-role="alert-icon"` | - | Alert icon |
| `data-role="alert-message"` | - | Alert message text |
| `data-role="alert-dismiss"` | - | Close button |

### Invite Codes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="invite-card"` | - | Invite code card |
| `data-invite-id` | string | Unique invite ID |
| `data-invite-code` | string | The actual code |
| `data-expired` | `true`, `false` | Expiration status |
| `data-role="invite-metadata"` | - | Metadata grid |
| `data-role="usage-indicator"` | - | Usage count display |

### Loading States

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-loading` | `true`, `false` | Loading indicator |
| `data-role="loading-container"` | - | Loading state wrapper |
| `data-role="skeleton"` | - | Skeleton placeholder |
| `data-skeleton-type` | `card`, `text`, `avatar`, `button`, `member-card` | Placeholder type |

### Empty States

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-role="empty-state"` | - | Empty state container |
| `data-empty-type` | `no-items`, `no-members`, `no-invites` | Context |
| `data-role="empty-title"` | - | Empty state heading |
| `data-role="empty-message"` | - | Empty state description |

### Section Headers

| Attribute | Description |
|-----------|-------------|
| `data-role="section-header"` | Section header container |
| `data-role="header-content"` | Header text content |
| `data-role="section-title"` | Section title |
| `data-role="section-description"` | Section description |

### Icons

| Attribute | Description |
|-----------|-------------|
| `data-role="icon-container"` | Icon wrapper/container |

### Action Buttons

| Attribute | Description |
|-----------|-------------|
| `data-role="action-buttons"` | Container for action buttons |

---

## Component Patterns

### Pattern 1: Hero Section

```html
<section data-role="section" data-section-type="hero" class="space-y-4">
  <p data-role="eyebrow-label" class="text-xs uppercase...">
    Dashboard
  </p>
  <h1 data-role="page-title" class="text-4xl font-semibold...">
    Welcome back
  </h1>
  <p data-role="page-description" class="text-base text-text-secondary...">
    Review your family data...
  </p>
</section>
```

### Pattern 2: Stat Card Grid

```html
<section data-role="grid" data-grid-type="stats" class="grid gap-6 md:grid-cols-2">
  <div data-role="stat-card" data-stat-type="members" class="rounded-2xl border...">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p data-role="stat-label" class="text-xs uppercase...">Members</p>
        <p data-role="stat-value" class="mt-3 text-3xl font-semibold...">4</p>
        <p data-role="stat-description" class="mt-1 text-xs...">Everyone with access</p>
      </div>
      <div data-role="stat-icon" class="rounded-full bg-primary-soft...">
        <Users :size="20" />
      </div>
    </div>
  </div>
</section>
```

### Pattern 3: Member List

```html
<ul data-role="list" data-list-type="members" class="mt-6 space-y-3">
  <li
    v-for="member in members"
    :key="member.id"
    data-role="list-item"
    data-item-type="member"
    :data-member-id="member.id"
    class="flex items-center justify-between..."
  >
    <div data-role="member-info">
      <p data-role="member-name" class="text-sm font-semibold...">{{ member.name }}</p>
      <p data-role="member-email" class="text-xs text-text-secondary...">{{ member.email }}</p>
    </div>
    <span data-role="badge" data-badge-type="role" class="rounded-full...">
      {{ member.role }}
    </span>
  </li>
</ul>
```

### Pattern 4: Disclosure / Accordion

```html
<Disclosure
  v-for="member in members"
  :key="member.id"
  v-slot="{ open }"
  as="article"
  data-role="disclosure"
  data-disclosure-type="member"
  :data-member-id="member.id"
  :data-state="open ? 'open' : 'closed'"
  class="rounded-2xl border..."
>
  <div data-role="disclosure-header" class="flex flex-col gap-3...">
    <DisclosureButton data-role="disclosure-trigger" class="flex flex-1...">
      <div data-role="member-info" class="flex items-center gap-3">
        <span data-role="avatar" class="flex h-9 w-9...">
          <img :src="avatar" :alt="name" />
        </span>
        <span data-role="member-name">{{ member.name }}</span>
      </div>
      <ChevronDown data-role="disclosure-icon" :class="[open ? 'rotate-180' : '']" />
    </DisclosureButton>
  </div>

  <DisclosurePanel data-role="disclosure-panel" class="space-y-4...">
    <!-- Expandable content -->
  </DisclosurePanel>
</Disclosure>
```

### Pattern 5: Wishlist Item Card

```html
<div
  data-role="item-card"
  :data-item-id="item.id"
  :data-priority="item.priority"
  :data-purchased="item.isPurchased"
  class="flex flex-col gap-3 rounded-xl..."
>
  <div data-role="item-header" class="flex items-start justify-between gap-3">
    <div data-role="item-content">
      <div data-role="item-title-row" class="flex items-center gap-2">
        <h3 data-role="item-title" class="text-sm font-semibold...">
          {{ item.title }}
        </h3>
        <span
          data-role="badge"
          data-badge-type="priority"
          :data-priority="item.priority"
          class="rounded-full..."
        >
          High priority
        </span>
      </div>
      <p data-role="item-description" class="mt-1 text-xs...">
        {{ item.description }}
      </p>
    </div>
  </div>

  <div data-role="item-metadata" class="flex flex-wrap items-center gap-2...">
    <span data-role="badge" data-badge-type="quantity" class="rounded-md...">
      Qty {{ item.quantity }}
    </span>
    <span data-role="badge" data-badge-type="store" class="rounded-md...">
      {{ item.store }}
    </span>
  </div>

  <div data-role="item-actions" class="flex flex-wrap items-center justify-between...">
    <div data-role="item-timestamp" class="inline-flex items-center gap-2">
      Updated {{ formatDate(item.updatedAt) }}
    </div>
    <div data-role="action-buttons" class="flex items-center gap-2">
      <a
        :href="item.url"
        data-role="button"
        data-action="view-external"
        class="rounded-full bg-primary..."
      >
        View
      </a>
      <button
        type="button"
        data-role="button"
        data-action="mark-purchased"
        class="rounded-md border..."
        @click="markPurchased(item.id)"
      >
        Mark purchased
      </button>
    </div>
  </div>
</div>
```

### Pattern 6: Form Structure

```html
<div data-role="form-container" data-form-type="login" class="max-w-md...">
  <header data-role="form-header" class="space-y-2">
    <h2 class="text-2xl font-semibold...">Sign in</h2>
    <p class="text-sm text-text-secondary...">Welcome back!</p>
  </header>

  <form data-role="form" @submit.prevent="handleSubmit">
    <div data-role="form-group" class="space-y-2">
      <label data-role="form-label" for="email" class="text-sm font-medium...">
        Email
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        data-role="form-input"
        :data-validation-state="emailError ? 'invalid' : 'valid'"
        class="w-full rounded-md border..."
      />
      <span v-if="emailError" data-role="form-error" class="text-sm text-danger">
        {{ emailError }}
      </span>
    </div>

    <div data-role="form-actions" class="flex gap-3">
      <button
        type="submit"
        data-role="button"
        data-action="submit"
        :data-loading="isSubmitting"
        class="rounded-md bg-primary..."
      >
        Sign in
      </button>
      <button
        type="button"
        data-role="button"
        data-action="cancel"
        class="rounded-md border..."
      >
        Cancel
      </button>
    </div>
  </form>
</div>
```

### Pattern 7: Alert/Notification

```html
<section
  v-if="error"
  data-role="alert"
  data-alert-type="error"
  class="rounded-2xl border border-danger-soft..."
>
  <div class="flex items-start gap-3">
    <AlertCircle data-role="alert-icon" class="text-danger" />
    <p data-role="alert-message" class="flex-1 text-sm text-danger">
      {{ error }}
    </p>
    <button
      type="button"
      data-role="alert-dismiss"
      data-action="close"
      @click="clearError"
    >
      <X :size="16" />
    </button>
  </div>
</section>
```

### Pattern 8: Loading Skeleton

```html
<div v-if="isLoading" data-loading="true" data-role="loading-container" class="mt-6 space-y-3">
  <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
  <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
  <div data-role="skeleton" data-skeleton-type="member-card" class="h-12 animate-pulse rounded-lg bg-surface-muted/40"></div>
</div>
```

### Pattern 9: Empty State

```html
<div
  v-else
  data-role="empty-state"
  data-empty-type="no-members"
  class="mt-6 rounded-md border border-dashed border-border px-3 py-4 text-center..."
>
  <h3 data-role="empty-title" class="text-sm font-semibold...">No members yet</h3>
  <p data-role="empty-message" class="mt-1 text-xs text-text-secondary...">
    Add or invite someone from the settings page.
  </p>
  <button
    data-role="button"
    data-action="add-member"
    class="mt-4 rounded-md bg-primary..."
  >
    Add member
  </button>
</div>
```

### Pattern 10: Badge Component (RoleBadge.vue)

```html
<span
  data-role="badge"
  data-badge-type="role"
  :data-role-type="role.toLowerCase()"
  :data-badge-size="size"
  :class="badgeClasses"
>
  <component
    :is="iconComponent"
    data-role="badge-icon"
    class="text-current"
  />
  <span data-role="badge-label">{{ label }}</span>
</span>
```

---

## Implementation Examples

### Example 1: Adding to a new View component

```vue
<template>
  <div data-role="page-container" class="min-h-screen bg-background">
    <div data-role="content-wrapper" class="mx-auto max-w-4xl px-6 py-16">
      <section data-role="section" data-section-type="hero" class="space-y-4">
        <p data-role="eyebrow-label">My Page</p>
        <h1 data-role="page-title">Page Title</h1>
        <p data-role="page-description">Description text</p>
      </section>

      <!-- Add more sections with appropriate data attributes -->
    </div>
  </div>
</template>
```

### Example 2: Adding to a reusable component

```vue
<!-- MyCard.vue -->
<template>
  <div
    data-role="card"
    :data-card-type="type"
    class="rounded-2xl border border-border..."
  >
    <div data-role="card-header" class="flex items-center justify-between">
      <h3 data-role="card-title">{{ title }}</h3>
      <button
        data-role="button"
        data-action="close"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
    <div data-role="card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  type?: string
}>()
</script>
```

### Example 3: Dynamic attributes with Vue

```vue
<template>
  <button
    data-role="button"
    :data-action="action"
    :data-loading="isLoading"
    :data-button-style="variant"
    :disabled="isLoading || disabled"
    class="rounded-md px-4 py-2..."
    @click="handleClick"
  >
    <Loader v-if="isLoading" data-role="loading-icon" class="animate-spin" />
    <span v-else>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  action: string
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()

const isLoading = ref(false)

const handleClick = async () => {
  isLoading.value = true
  try {
    // Perform action
  } finally {
    isLoading.value = false
  }
}
</script>
```

---

## Testing & Automation

### Playwright Examples

```typescript
// Test: Navigate using quick links
await page.click('[data-role="quick-link"][data-link-type="settings"]')

// Test: Find a specific member
const member = page.locator('[data-role="list-item"][data-member-id="123"]')
await expect(member).toBeVisible()

// Test: Check member name
const memberName = member.locator('[data-role="member-name"]')
await expect(memberName).toHaveText('John Doe')

// Test: Expand disclosure
await page.click('[data-role="disclosure"][data-member-id="123"] [data-role="disclosure-trigger"]')
await expect(page.locator('[data-role="disclosure"][data-member-id="123"][data-state="open"]')).toBeVisible()

// Test: Mark item as purchased
await page.click('[data-item-id="456"] [data-action="mark-purchased"]')
await expect(page.locator('[data-item-id="456"][data-purchased="true"]')).toBeVisible()

// Test: Submit form
await page.fill('[data-role="form-input"][type="email"]', 'test@example.com')
await page.click('[data-role="button"][data-action="submit"]')
await expect(page.locator('[data-role="button"][data-action="submit"][data-loading="true"]')).toBeVisible()

// Test: Check for error alert
await expect(page.locator('[data-role="alert"][data-alert-type="error"]')).toBeVisible()

// Test: Verify stat card value
const memberCount = page.locator('[data-stat-type="members"] [data-role="stat-value"]')
await expect(memberCount).toHaveText('4')

// Test: Filter by priority
const highPriorityItems = page.locator('[data-role="item-card"][data-priority="high"]')
await expect(highPriorityItems).toHaveCount(2)
```

### Cypress Examples

```javascript
// Navigate to settings
cy.get('[data-role="quick-link"][data-link-type="settings"]').click()

// Find and click on a member
cy.get('[data-role="list-item"][data-member-id="123"]')
  .find('[data-role="member-name"]')
  .should('have.text', 'John Doe')

// Expand member wishlist
cy.get('[data-role="disclosure"][data-member-id="123"]')
  .find('[data-role="disclosure-trigger"]')
  .click()

cy.get('[data-role="disclosure"][data-member-id="123"]')
  .should('have.attr', 'data-state', 'open')

// Mark item as purchased
cy.get('[data-item-id="456"]')
  .find('[data-action="mark-purchased"]')
  .click()

cy.get('[data-item-id="456"]')
  .should('have.attr', 'data-purchased', 'true')

// Submit form
cy.get('[data-role="form-input"][type="email"]').type('test@example.com')
cy.get('[data-role="button"][data-action="submit"]').click()
cy.get('[data-role="button"][data-action="submit"]')
  .should('have.attr', 'data-loading', 'true')
```

### CSS Selectors

```css
/* Style all primary buttons in loading state */
[data-role="button"][data-action="submit"][data-loading="true"] {
  opacity: 0.6;
  pointer-events: none;
}

/* Style high priority badges */
[data-badge-type="priority"][data-priority="high"] {
  /* custom styles */
}

/* Style open disclosures */
[data-role="disclosure"][data-state="open"] {
  /* custom styles */
}

/* Hide elements with data-visible="false" */
[data-visible="false"] {
  display: none;
}
```

---

## Files Completed

### ✅ Fully Implemented

1. **DashboardView.vue** - Complete with all data attributes
2. **FamilyView.vue** - Complete with all data attributes
3. **RoleBadge.vue** - Complete with all data attributes

### 🔄 To Be Implemented

Follow the patterns above to add data attributes to these remaining files:

**Views:**
- MyWishlistView.vue
- SettingsView.vue
- AuthView.vue
- AboutView.vue

**Components:**
- LoginForm.vue
- RegisterForm.vue
- AddItemForm.vue
- EditItemForm.vue
- family/FamilyInfoCard.vue
- family/InviteCodeManager.vue
- family/JoinFamilyModal.vue
- family/MemberManagement.vue

---

## Best Practices

1. **Always add `data-role`** to structural elements
2. **Use specific identifiers** for dynamic/data-driven elements (`data-member-id`, `data-item-id`)
3. **Include state attributes** for interactive components (`data-state`, `data-loading`)
4. **Be consistent** with naming across similar components
5. **Don't over-attribute** - only add what provides semantic value
6. **Keep styling separate** - data attributes describe structure, not appearance
7. **Document custom patterns** when you create new component types
8. **Test your selectors** - ensure data attributes work well with Playwright/Cypress

---

## Questions or Issues?

If you encounter edge cases or need to define new data attribute patterns:

1. Check if a similar pattern already exists in this guide
2. Follow the naming conventions outlined above
3. Add new patterns to this document for team reference
4. Ensure consistency with existing attributes

---

**Last Updated:** 2025-01-27
**Version:** 1.0
**Maintained by:** Development Team
