<script setup>
import { ref, onMounted } from 'vue'
import { UserX, UserCheck } from 'lucide-vue-next'
import api from '../api.js'

const bannedUsers = ref([])
const search = ref('')
const banId = ref('')
const banReason = ref('')
const showModal = ref(false)

async function load() {
  const { data } = await api.get('/users/banned', { params: { search: search.value } })
  bannedUsers.value = data
}

async function banUser() {
  if (!banId.value) return
  await api.post('/users/ban', { telegram_user_id: banId.value, reason: banReason.value })
  banId.value = ''
  banReason.value = ''
  showModal.value = false
  load()
}

async function unban(userId) {
  await api.post('/users/unban', { telegram_user_id: userId })
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-semibold">Banned Users</h2>
      <button @click="showModal = true" class="flex items-center gap-2 bg-danger/15 text-danger hover:bg-danger/25 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        <UserX :size="16" />
        Ban User
      </button>
    </div>

    <input v-model="search" @input="load" placeholder="Search by ID or username..."
      class="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary mb-5" />

    <div v-if="!bannedUsers.length" class="text-text-muted text-sm py-12 text-center">No banned users</div>

    <div v-else class="space-y-2">
      <div v-for="u in bannedUsers" :key="u.user_id" class="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-4">
        <div class="flex-1">
          <p class="text-sm font-medium">{{ u.first_name || u.username || 'Unknown' }}</p>
          <p class="text-xs text-text-muted">ID: {{ u.user_id }} {{ u.username ? '• @' + u.username : '' }}</p>
        </div>
        <span class="text-xs text-text-muted">{{ u.reason }}</span>
        <button @click="unban(u.user_id)" class="p-2 rounded-lg bg-success/15 text-success hover:bg-success/25 transition-colors" title="Unban">
          <UserCheck :size="16" />
        </button>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50" @click.self="showModal = false">
      <form @submit.prevent="banUser" class="bg-surface border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold">Ban User</h3>
        <input v-model="banId" placeholder="Telegram User ID" class="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
        <input v-model="banReason" placeholder="Reason (optional)" class="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
        <div class="flex gap-3">
          <button type="button" @click="showModal = false" class="flex-1 border border-border rounded-lg py-2.5 text-sm hover:bg-surface-hover transition-colors">Cancel</button>
          <button type="submit" class="flex-1 bg-danger text-white rounded-lg py-2.5 text-sm font-medium hover:bg-danger/80 transition-colors">Ban</button>
        </div>
      </form>
    </div>
  </div>
</template>
