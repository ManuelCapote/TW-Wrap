<script setup lang="ts">
import { ref } from 'vue'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
  SwitchRoot,
  SwitchThumb,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent
} from 'radix-vue'

const notificationsEnabled = ref(true)
const remindersEnabled = ref(false)

const spacingScale = [
  { token: 'xs', label: 'XS', px: 4, usage: 'Micro-layout padding & icon gaps' },
  { token: 'sm', label: 'SM', px: 8, usage: 'Tight component breathing room' },
  { token: 'md', label: 'MD', px: 16, usage: 'Standard section spacing' },
  { token: 'lg', label: 'LG', px: 24, usage: 'Page gutters & feature cards' },
  { token: 'xl', label: 'XL', px: 32, usage: 'Hero blocks & vertical rhythm' }
]

const accentPalette = [
  { name: 'Primary', token: '--color-primary', class: 'bg-primary', hex: '#3b82f6' },
  { name: 'Primary Hover', token: '--color-primary-hover', class: 'bg-primary-hover', hex: '#2563eb' },
  { name: 'Soft Accent', token: '--color-primary-soft', class: 'bg-primary-soft', hex: 'rgba(59, 130, 246, 0.15)' },
  { name: 'Surface', token: '--color-surface', class: 'bg-surface', hex: '#1a1a1a' },
  { name: 'Surface Muted', token: '--color-surface-muted', class: 'bg-surface-muted', hex: '#262626' }
]

const quickActions = [
  {
    title: 'Family Planning Session',
    description: 'Set up an agenda and assign pre-work',
    eta: '45 mins',
    priority: 'High'
  },
  {
    title: 'Wishlist Audit',
    description: 'Review items that need confirmation',
    eta: '25 mins',
    priority: 'Medium'
  },
  {
    title: 'Gifting Budget Review',
    description: 'Align on allocations and approvals',
    eta: '30 mins',
    priority: 'Low'
  }
]
</script>

<template>
  <div class="min-h-screen bg-background text-text">
    <div class="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-20 space-y-16">
      <section class="space-y-6">
        <span class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
          Design Spike
        </span>
        <div class="space-y-4">
          <h1 class="text-4xl font-semibold tracking-tight md:text-5xl">
            Minimal UI system for focused collaboration
          </h1>
          <p class="max-w-2xl text-base text-text-secondary md:text-lg">
            Exploring a Tailwind + Radix stack to capture the calm, purposeful feeling of
            tools like Notion and Linear. This spike maps typography rhythm, spacing, and
            component states to our existing design tokens.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Launch Interactive Demo
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition duration-200 ease-soft-snap hover:border-border-hover hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border"
          >
            Review Design Tokens
          </button>
        </div>
      </section>

      <section class="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20 md:px-8 md:py-8">
          <TabsRoot default-value="typography" class="space-y-8">
            <TabsList
              class="inline-flex rounded-lg border border-border bg-background/60 p-1 text-text-secondary"
            >
              <TabsTrigger
                value="typography"
                class="rounded-md px-4 py-2 text-sm font-semibold transition duration-150 ease-soft-snap data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/30"
              >
                Typography
              </TabsTrigger>
              <TabsTrigger
                value="components"
                class="rounded-md px-4 py-2 text-sm font-semibold transition duration-150 ease-soft-snap data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/30"
              >
                Components
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                class="rounded-md px-4 py-2 text-sm font-semibold transition duration-150 ease-soft-snap data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/30"
              >
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="typography" class="space-y-8">
              <div class="space-y-4">
                <p class="text-xs uppercase tracking-[0.35em] text-text-tertiary">Display</p>
                <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">
                  Family planning that feels effortless
                </h2>
                <p class="max-w-2xl text-sm text-text-secondary md:text-base">
                  Multi-weight typography with generous leading echoes the calm precision of
                  your inspiration references. We lean on a system font stack for now; the rhythm
                  is tuned through consistent 4px increments.
                </p>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2 rounded-lg border border-border bg-surface-muted/60 p-4">
                  <p class="text-xs uppercase tracking-[0.45em] text-text-tertiary">
                    Heading Scale
                  </p>
                  <div class="space-y-2">
                    <p class="text-text-secondary text-sm">H1 • 40px / 48px</p>
                    <h3 class="text-2xl font-semibold tracking-tight">Better rituals</h3>
                  </div>
                  <div class="space-y-2">
                    <p class="text-text-secondary text-sm">H2 • 32px / 40px</p>
                    <h4 class="text-xl font-semibold tracking-tight">Shared visibility</h4>
                  </div>
                  <div class="space-y-2">
                    <p class="text-text-secondary text-sm">H3 • 24px / 32px</p>
                    <h5 class="text-lg font-semibold tracking-tight">Actionable alignment</h5>
                  </div>
                </div>
                <div class="space-y-4 rounded-lg border border-border bg-surface-muted/60 p-4">
                  <p class="text-xs uppercase tracking-[0.45em] text-text-tertiary">
                    Body & Meta
                  </p>
                  <p class="text-sm text-text-secondary">
                    Body text anchors the system at 16px with 1.6 line height. Secondary
                    statements drop to 14px while retaining legibility in the dark theme through
                    softer contrast.
                  </p>
                  <div class="rounded-md border border-dashed border-border p-3 text-xs text-text-tertiary">
                    <p class="font-semibold text-text">Microcopy example</p>
                    <p>Last synced 3 minutes ago · San Francisco crew</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="components" class="space-y-6">
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-4 rounded-xl border border-border bg-surface-muted/60 p-5">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-text">Notifications</p>
                      <p class="text-xs text-text-secondary">Heads-up before key milestones</p>
                    </div>
                    <SwitchRoot
                      v-model:checked="notificationsEnabled"
                      class="relative inline-flex h-6 w-11 items-center rounded-full border border-border bg-background transition duration-150 ease-soft-snap data-[state=checked]:border-transparent data-[state=checked]:bg-primary"
                    >
                      <SwitchThumb
                        class="block h-5 w-5 translate-x-0.5 rounded-full bg-surface transition duration-150 ease-soft-snap shadow-[0_2px_8px_rgba(0,0,0,0.35)] data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-white"
                      />
                    </SwitchRoot>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-text">Smart reminders</p>
                      <p class="text-xs text-text-secondary">Only when action is required</p>
                    </div>
                    <SwitchRoot
                      v-model:checked="remindersEnabled"
                      class="relative inline-flex h-6 w-11 items-center rounded-full border border-border bg-background transition duration-150 ease-soft-snap data-[state=checked]:border-transparent data-[state=checked]:bg-primary"
                    >
                      <SwitchThumb
                        class="block h-5 w-5 translate-x-0.5 rounded-full bg-surface transition duration-150 ease-soft-snap shadow-[0_2px_8px_rgba(0,0,0,0.35)] data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-white"
                      />
                    </SwitchRoot>
                  </div>
                </div>

                <div class="space-y-4 rounded-xl border border-border bg-surface-muted/40 p-5">
                  <p class="text-sm font-semibold text-text">Call-to-action hierarchy</p>
                  <div class="flex flex-wrap gap-3">
                    <button
                      class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover"
                    >
                      Primary
                    </button>
                    <button
                      class="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition duration-200 ease-soft-snap hover:border-border-hover"
                    >
                      Secondary
                    </button>
                    <button
                      class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition duration-200 ease-soft-snap hover:text-text"
                    >
                      Tertiary Link
                    </button>
                  </div>
                  <p class="text-xs text-text-tertiary">
                    Button styling echoes Linear’s weightlessness—crisp radius, subtle blur
                    shadows, and eased hover states.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" class="space-y-4 text-sm text-text-secondary">
              <div class="rounded-xl border border-border bg-surface-muted/40 p-5">
                <p class="text-text font-semibold">Layering Principles</p>
                <ul class="mt-3 space-y-2 text-text-secondary">
                  <li>• Keep shadows short and soft for minimal noise.</li>
                  <li>• Use soft blurs and border overlays to stage depth.</li>
                  <li>• Maintain consistent curvature across components.</li>
                </ul>
              </div>
              <div class="rounded-xl border border-border bg-surface-muted/40 p-5">
                <p class="text-text font-semibold">Next Validation Steps</p>
                <ul class="mt-3 space-y-2 text-text-secondary">
                  <li>• Test with dense real data to tune condensed states.</li>
                  <li>• Align token naming with design source of truth.</li>
                  <li>• Explore light theme parity and color contrast ratios.</li>
                </ul>
              </div>
            </TabsContent>
          </TabsRoot>
        </div>

        <aside class="space-y-8">
          <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-text">Spacing scale</p>
              <span class="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                4px base
              </span>
            </div>
            <ul class="mt-6 space-y-4">
              <li
                v-for="step in spacingScale"
                :key="step.token"
                class="space-y-2 rounded-lg border border-border bg-surface-muted/40 p-3"
              >
                <div class="flex items-center justify-between text-xs text-text-secondary">
                  <span class="text-sm font-semibold text-text">{{ step.label }}</span>
                  <span>{{ step.px }}px</span>
                </div>
                <div
                  class="rounded-full bg-primary-soft"
                  :style="{ height: `${Math.max(step.px / 2, 6)}px` }"
                ></div>
                <p class="text-xs text-text-tertiary">
                  {{ step.usage }}
                </p>
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border border-border bg-surface px-5 py-6 shadow-md shadow-black/20">
            <p class="text-sm font-semibold text-text">Token palette</p>
            <div class="mt-4 grid gap-3">
              <div
                v-for="color in accentPalette"
                :key="color.token"
                class="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-3"
              >
                <div>
                  <p class="text-sm font-semibold text-text">{{ color.name }}</p>
                  <p class="text-xs text-text-secondary">{{ color.token }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-text-tertiary">{{ color.hex }}</span>
                  <div :class="['h-8 w-8 rounded-md border border-border', color.class]"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section class="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20 md:px-8 md:py-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.4em] text-text-tertiary">Agenda</p>
              <h3 class="mt-3 text-2xl font-semibold tracking-tight">Team Alignments</h3>
              <p class="mt-2 max-w-xl text-sm text-text-secondary">
                A sample surface that mixes structured data with interactive affordances. The
                goal: maintain clarity while layering interactions.
              </p>
            </div>
            <PopoverRoot>
              <PopoverTrigger
                class="rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary transition duration-150 ease-soft-snap hover:border-border-hover hover:text-text"
              >
                Quick Add
              </PopoverTrigger>
              <PopoverContent
                class="z-10 w-64 rounded-xl border border-border bg-surface p-4 text-sm text-text shadow-lg shadow-black/40 data-[state=open]:animate-scale-in"
              >
                <p class="font-semibold text-text">Inline actions</p>
                <p class="mt-1 text-xs text-text-secondary">
                  Keep interactions close to the context so teams stay in flow.
                </p>
                <div class="mt-4 space-y-2">
                  <button class="w-full rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition duration-150 ease-soft-snap hover:bg-primary-hover">
                    Plan retrospective
                  </button>
                  <button class="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition duration-150 ease-soft-snap hover:border-border-hover">
                    Capture decision log
                  </button>
                </div>
              </PopoverContent>
            </PopoverRoot>
          </div>

          <div class="mt-8 space-y-4">
            <div
              v-for="item in quickActions"
              :key="item.title"
              class="rounded-xl border border-border bg-surface-muted/40 p-4 transition duration-200 ease-soft-snap hover:border-primary hover:shadow-md hover:shadow-primary/20"
            >
              <div class="flex items-center justify-between gap-4">
                <p class="text-sm font-semibold text-text">{{ item.title }}</p>
                <span
                  class="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-text-secondary"
                >
                  {{ item.eta }}
                </span>
              </div>
              <p class="mt-2 text-sm text-text-secondary">
                {{ item.description }}
              </p>
              <div class="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                <span>Priority: {{ item.priority }}</span>
                <button class="text-text-secondary transition hover:text-text">
                  Open thread →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <div class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20">
            <p class="text-sm font-semibold text-text">Overlay cadence</p>
            <p class="mt-2 text-sm text-text-secondary">
              Dialogs inherit Radix accessibility essentials while the visual wrapper stays in
              sync with our system tokens.
            </p>
            <DialogRoot>
              <DialogTrigger
                class="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover"
              >
                Preview dialog
              </DialogTrigger>
              <DialogOverlay class="fixed inset-0 z-30 grid place-items-center bg-black/70 backdrop-blur">
                <DialogContent
                  class="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-text shadow-xl shadow-black/50 data-[state=open]:animate-scale-in"
                >
                  <DialogTitle class="text-xl font-semibold tracking-tight">
                    Share with the family crew
                  </DialogTitle>
                  <DialogDescription class="mt-2 text-sm text-text-secondary">
                    Everyone gets context and the latest decisions in one workspace.
                  </DialogDescription>
                  <div class="mt-5 space-y-3">
                    <div class="space-y-1">
                      <label class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
                        Invite link
                      </label>
                      <div class="flex gap-2">
                        <input
                          class="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
                          value="https://tw-app.dev/invite/family"
                          readonly
                        />
                        <button
                          class="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-border-hover hover:text-text"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <label class="text-xs font-semibold uppercase tracking-[0.35em] text-text-tertiary">
                        Include message
                      </label>
                      <textarea
                        rows="3"
                        class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-border-hover focus:ring-2 focus:ring-primary/40"
                        placeholder="Quick note to set expectations..."
                      ></textarea>
                    </div>
                  </div>
                  <div class="mt-6 flex justify-end gap-3">
                    <DialogClose
                      class="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-border-hover hover:text-text"
                    >
                      Cancel
                    </DialogClose>
                    <button
                      class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-soft-snap hover:bg-primary-hover"
                    >
                      Send invite
                    </button>
                  </div>
                </DialogContent>
              </DialogOverlay>
            </DialogRoot>
          </div>

          <div class="rounded-2xl border border-border bg-surface px-6 py-6 shadow-md shadow-black/20">
            <p class="text-sm font-semibold text-text">State cues</p>
            <div class="mt-4 grid gap-3 text-xs text-text-secondary">
              <div class="flex items-center justify-between rounded-md bg-success-soft px-3 py-2">
                <span class="font-semibold text-success">Success</span>
                <span>Task completed</span>
              </div>
              <div class="flex items-center justify-between rounded-md bg-warning-soft px-3 py-2">
                <span class="font-semibold text-warning">Warning</span>
                <span>Action required soon</span>
              </div>
              <div class="flex items-center justify-between rounded-md bg-danger-soft px-3 py-2">
                <span class="font-semibold text-danger">Critical</span>
                <span>Budget exceeded</span>
              </div>
            </div>
            <p class="mt-4 text-xs text-text-tertiary">
              Color cues stay subtle; typography and layout shoulder most of the communication.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.bg-primary-soft {
  background: var(--color-primary-soft);
}
</style>
