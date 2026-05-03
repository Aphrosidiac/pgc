<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Check, X, Ban, Power, Shield } from 'lucide-vue-next'
import api from '../api.js'
import { connectSSE } from '../sse.js'

const confessions = ref([])
const botActive = ref(true)
const modEnabled = ref(false)
const loading = ref(true)
let sse = null

async function load() {
  loading.value = true
  const { data } = await api.get('/confessions', { params: { status: 'pending', limit: 50 } })
  confessions.value = data.rows
  loading.value = false
}

async function loadSettings() {
  const [bot, mod] = await Promise.all([
    api.get('/settings/bot-status'),
    api.get('/settings/moderation'),
  ])
  botActive.value = bot.data.active
  modEnabled.value = mod.data.enabled
}

async function toggleBot() {
  const { data } = await api.post('/settings/bot-status', { active: !botActive.value })
  botActive.value = data.active
}

async function toggleModeration() {
  const { data } = await api.post('/settings/moderation', { enabled: !modEnabled.value })
  modEnabled.value = data.enabled
}

async function approve(id) {
  await api.post(`/confessions/${id}/approve`)
  confessions.value = confessions.value.filter(c => c.id !== id)
}

async function reject(id) {
  await api.post(`/confessions/${id}/reject`)
  confessions.value = confessions.value.filter(c => c.id !== id)
}

async function ban(id) {
  if (!confirm('Ban this user?')) return
  const confession = confessions.value.find(c => c.id === id)
  await api.post('/users/ban', { telegram_user_id: confession.user_id, reason: 'Banned from dashboard' })
  await api.post(`/confessions/${id}/reject`)
  confessions.value = confessions.value.filter(c => c.id !== id)
}

onMounted(() => {
  load()
  loadSettings()
  sse = connectSSE((event, data) => {
    if (event === 'new_confession' && !data.auto) {
      confessions.value.unshift({ id: data.id, type: data.type, content: data.content, user_id: data.user_id, username: data.username, status: 'pending', created_at: new Date().toISOString() })
    }
    if (event === 'moderation_action') {
      confessions.value = confessions.value.filter(c => c.id !== data.id)
    }
  })
})

onUnmounted(() => { sse?.close() })
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold">Moderation Queue</h2>
        <p class="text-text-muted text-sm mt-1">
          <template v-if="modEnabled">{{ confessions.length }} pending</template>
          <template v-else>Auto-posting — straight to channel</template>
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="toggleModeration"
          class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.97]"
          :class="modEnabled ? 'bg-primary/15 text-primary-hover hover:bg-primary/25' : 'bg-surface border border-border text-text-muted hover:bg-surface-hover'">
          <Shield :size="16" />
          Review {{ modEnabled ? 'ON' : 'OFF' }}
        </button>
        <button @click="toggleBot"
          class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.97]"
          :class="botActive ? 'bg-success/15 text-success hover:bg-success/25' : 'bg-danger/15 text-danger hover:bg-danger/25'">
          <Power :size="16" />
          Bot {{ botActive ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>

    <div v-if="!modEnabled" class="bg-surface border border-border rounded-xl p-6 sm:p-8 text-center">
      <p class="text-text-muted text-sm">Moderation is off. All confessions are auto-posted to the channel.</p>
      <p class="text-text-muted text-sm mt-2">Turn on <span class="text-primary-hover font-medium">Review</span> to manually approve confessions before they go live.</p>
    </div>

    <template v-else>
      <div v-if="loading" class="text-text-muted text-sm">Loading...</div>
      <div v-else-if="!confessions.length" class="text-text-muted text-sm py-12 text-center">No pending confessions</div>

      <div v-else class="space-y-3">
        <div v-for="c in confessions" :key="c.id" class="bg-surface border border-border rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-mono text-text-muted">#{{ c.id }}</span>
            <span v-if="c.type === 'photo'" class="text-xs bg-primary/15 text-primary-hover px-2 py-0.5 rounded">Photo</span>
          </div>
          <p class="text-sm whitespace-pre-wrap break-words mb-2">{{ c.content || '(no text)' }}</p>
          <div class="flex items-center justify-between">
            <p class="text-xs text-text-muted">{{ c.username ? '@' + c.username : 'ID: ' + c.user_id }}</p>
            <div class="flex gap-2">
              <button @click="approve(c.id)" class="p-2.5 rounded-lg bg-success/15 text-success hover:bg-success/25 active:scale-[0.93] transition-all" title="Approve">
                <Check :size="18" />
              </button>
              <button @click="reject(c.id)" class="p-2.5 rounded-lg bg-danger/15 text-danger hover:bg-danger/25 active:scale-[0.93] transition-all" title="Reject">
                <X :size="18" />
              </button>
              <button @click="ban(c.id)" class="p-2.5 rounded-lg bg-warning/15 text-warning hover:bg-warning/25 active:scale-[0.93] transition-all" title="Ban User">
                <Ban :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
