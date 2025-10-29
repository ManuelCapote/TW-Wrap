<script setup lang="ts">
import { ref } from 'vue'
import { useFamilyStore } from '@/stores/family'
import FamilyInfoCard from '@/components/family/FamilyInfoCard.vue'
import MemberManagement from '@/components/family/MemberManagement.vue'
import InviteCodeManager from '@/components/family/InviteCodeManager.vue'
import JoinFamilyModal from '@/components/family/JoinFamilyModal.vue'
import { Info, Ticket, X, CheckCircle, AlertTriangle } from 'lucide-vue-next'

const familyStore = useFamilyStore()
const showJoinModal = ref(false)
const successMessage = ref<string | null>(null)

const handleJoinSuccess = async () => {
  showJoinModal.value = false
  successMessage.value = 'Successfully joined new family!'

  await familyStore.fetchFamilyMembers()
  await familyStore.fetchFamily()

  setTimeout(() => {
    successMessage.value = null
  }, 5000)
}
</script>

<template>
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-5xl space-y-12 px-6 py-16 md:px-8 md:py-20">
      <header class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Settings
        </p>
        <div class="space-y-3">
          <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
            Manage your family workspace
          </h1>
          <p class="max-w-2xl text-base text-text-secondary md:text-lg">
            Update family details, curate members, and share invite codes with the people you trust.
          </p>
        </div>
      </header>

      <section class="space-y-6">
        <FamilyInfoCard />

        <MemberManagement />

        <InviteCodeManager v-if="familyStore.isAdmin" />

        <div
          v-else
          class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20"
        >
          <div class="flex items-start gap-3">
            <div class="rounded-full bg-primary-soft p-2 text-primary">
              <Info :size="16" :stroke-width="1.8" />
            </div>
            <div class="space-y-2 text-sm text-text-secondary">
              <h2 class="text-base font-semibold text-text">Member account</h2>
              <p>
                You’re a member of this family. Reach out to an admin if you’d like to invite someone or adjust family details.
              </p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-4">
            <div class="space-y-1 text-sm text-text-secondary">
              <p class="text-text font-semibold">Have an invite code?</p>
              <p class="text-xs">
                Use it to join another family workspace. You’ll keep all of your wishlist items.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover"
              @click="showJoinModal = true"
            >
              <Ticket :size="18" :stroke-width="1.8" />
              Join another family
            </button>
          </div>
        </div>
      </section>

      <div v-if="successMessage" class="flex items-center gap-3 rounded-xl border border-success bg-success-soft/40 px-4 py-3 text-sm font-semibold text-success">
        <CheckCircle :size="18" :stroke-width="1.8" />
        <span class="flex-1">{{ successMessage }}</span>
        <button
          type="button"
          class="rounded-md border border-success/40 bg-background px-2 py-1 text-xs text-success transition duration-150 ease-soft-snap hover:bg-success/10"
          @click="successMessage = null"
        >
          Dismiss
        </button>
      </div>

      <div
        v-if="familyStore.error"
        class="flex items-center gap-3 rounded-xl border border-danger bg-danger-soft/40 px-4 py-3 text-sm font-semibold text-danger"
      >
        <AlertTriangle :size="18" :stroke-width="1.8" />
        <span class="flex-1">{{ familyStore.error }}</span>
        <button
          type="button"
          class="rounded-md border border-danger/40 bg-background px-2 py-1 text-xs text-danger transition duration-150 ease-soft-snap hover:bg-danger/10"
          @click="familyStore.clearError()"
        >
          <X :size="14" :stroke-width="1.8" />
        </button>
      </div>
    </div>

    <JoinFamilyModal
      :is-open="showJoinModal"
      :current-family-name="familyStore.familyName"
      @close="showJoinModal = false"
      @success="handleJoinSuccess"
    />
  </div>
</template>
