<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import EditProfileForm from '@/components/profile/EditProfileForm.vue'
import ChangePasswordForm from '@/components/profile/ChangePasswordForm.vue'
import DeleteAccountModal from '@/components/profile/DeleteAccountModal.vue'
import { CheckCircle, User, Lock, Trash2, Edit, Info } from 'lucide-vue-next'
import { generateAvatarDataUri } from '@/utils/avatar'

const authStore = useAuthStore()
const showEditProfile = ref(false)
const showChangePassword = ref(false)
const showDeleteAccount = ref(false)
const successMessage = ref<string | null>(null)

const userAvatarUrl = computed(() => {
  return generateAvatarDataUri(authStore.user?.avatar || authStore.user?.email || 'default')
})

const handleProfileSuccess = () => {
  successMessage.value = 'Profile updated successfully!'
  setTimeout(() => {
    successMessage.value = null
  }, 5000)
}

const handlePasswordSuccess = () => {
  successMessage.value = 'Password changed successfully!'
  setTimeout(() => {
    successMessage.value = null
  }, 5000)
}
</script>

<template>
  <div data-role="page-container" class="min-h-screen bg-background text-text">
    <div data-role="content-wrapper" class="mx-auto max-w-5xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <header data-role="section" data-section-type="hero" class="space-y-4">
        <p data-role="eyebrow-label" class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Settings
        </p>
        <div class="space-y-3">
          <h1 data-role="page-title" class="text-4xl font-semibold tracking-tight md:text-5xl">
            Account settings
          </h1>
          <p data-role="page-description" class="max-w-2xl text-base text-text-secondary md:text-lg">
            Manage your profile, security settings, and account preferences.
          </p>
        </div>
      </header>

      <!-- User Profile Section -->
      <section data-role="section" data-section-type="user-profile" class="space-y-4">
        <div class="flex items-center gap-2">
          <User :size="20" :stroke-width="1.8" class="text-text-tertiary" />
          <h2 class="text-xl font-semibold tracking-tight">Your Profile</h2>
        </div>

        <div
          data-role="card"
          data-card-type="user-profile"
          class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20"
        >
          <!-- Profile Info Display -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <img
                :src="userAvatarUrl"
                alt="User avatar"
                data-role="avatar"
                class="h-16 w-16 rounded-full border-2 border-border object-cover"
              />
              <div class="space-y-1">
                <h3 class="text-lg font-semibold text-text">{{ authStore.user?.name }}</h3>
                <p class="text-sm text-text-secondary">{{ authStore.user?.email }}</p>
              </div>
            </div>
            <button
              type="button"
              data-role="button"
              data-action="edit-profile"
              class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover"
              @click="showEditProfile = true"
            >
              <Edit :size="16" :stroke-width="1.8" />
              Edit Profile
            </button>
          </div>

          <!-- Profile Actions -->
          <div class="mt-6 grid gap-3 border-t border-border pt-6 md:grid-cols-2">
            <button
              type="button"
              data-role="button"
              data-action="change-password"
              class="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition duration-200 ease-soft-snap hover:border-primary hover:bg-primary-soft/20"
              @click="showChangePassword = true"
            >
              <div class="rounded-lg bg-primary-soft p-2 text-primary">
                <Lock :size="18" :stroke-width="1.8" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-semibold text-text">Change Password</p>
                <p class="text-xs text-text-secondary">Update your account password</p>
              </div>
            </button>

            <button
              type="button"
              data-role="button"
              data-action="delete-account"
              class="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition duration-200 ease-soft-snap hover:border-danger hover:bg-danger-soft/20"
              @click="showDeleteAccount = true"
            >
              <div class="rounded-lg bg-danger-soft p-2 text-danger">
                <Trash2 :size="18" :stroke-width="1.8" />
              </div>
              <div class="space-y-1">
                <p class="text-sm font-semibold text-danger">Delete Account</p>
                <p class="text-xs text-text-secondary">Permanently remove your account</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section data-role="section" data-section-type="about" class="space-y-4">
        <div class="flex items-center gap-2">
          <Info :size="20" :stroke-width="1.8" class="text-text-tertiary" />
          <h2 class="text-xl font-semibold tracking-tight">About Turtle Wrap</h2>
        </div>

        <div
          data-role="card"
          data-card-type="about"
          class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20"
        >
          <div class="space-y-4 text-sm text-text-secondary">
            <p class="text-base font-semibold text-text">
              🐢 A simple family wishlist app
            </p>
            <p>
              Turtle Wrap helps families share gift ideas and avoid duplicate purchases.
              Create your wishlist, invite your family members, and see what everyone wants for special occasions.
            </p>
            <div class="space-y-2 border-t border-border pt-4">
              <p class="text-xs text-text-tertiary">
                Version 1.0.0
              </p>
              <p class="text-xs text-text-tertiary">
                Built with Vue 3, TypeScript, and ❤️
              </p>
            </div>
          </div>
        </div>
      </section>

      <div v-if="successMessage" data-role="alert" data-alert-type="success" class="flex items-center gap-3 rounded-xl border border-success bg-success-soft/40 px-4 py-3 text-sm font-semibold text-success">
        <CheckCircle data-role="alert-icon" :size="18" :stroke-width="1.8" />
        <span data-role="alert-message" class="flex-1">{{ successMessage }}</span>
        <button
          type="button"
          data-role="alert-dismiss"
          data-action="close"
          class="rounded-md border border-success/40 bg-background px-2 py-1 text-xs text-success transition duration-150 ease-soft-snap hover:bg-success/10"
          @click="successMessage = null"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Modals -->
    <EditProfileForm
      v-if="showEditProfile"
      @close="showEditProfile = false"
      @success="handleProfileSuccess"
    />

    <ChangePasswordForm
      v-if="showChangePassword"
      @close="showChangePassword = false"
      @success="handlePasswordSuccess"
    />

    <DeleteAccountModal
      v-if="showDeleteAccount"
      @close="showDeleteAccount = false"
    />
  </div>
</template>
