<script setup>
import { ref, onMounted } from 'vue'
import api from '../api.js'

const logs = ref([])
const page = ref(1)
const total = ref(0)

async function load() {
  const { data } = await api.get('/logs', { params: { page: page.value } })
  logs.value = data.rows
  total.value = data.total
}

onMounted(load)

function actionColor(action) {
  if (action === 'approve') return 'text-success bg-success/15'
  if (action === 'reject') return 'text-danger bg-danger/15'
  if (action === 'ban') return 'text-warning bg-warning/15'
  if (action === 'unban') return 'text-success bg-success/15'
  return 'text-text-muted bg-surface-hover'
}

const totalPages = () => Math.ceil(total.value / 50)
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Activity Log</h2>

    <div v-if="!logs.length" class="text-text-muted text-sm py-12 text-center">No activity yet</div>

    <div v-else class="space-y-2">
      <div v-for="log in logs" :key="log.id" class="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-4">
        <span :class="actionColor(log.action)" class="text-xs px-2 py-0.5 rounded capitalize w-20 text-center shrink-0">{{ log.action }}</span>
        <span class="text-sm flex-1">{{ log.details || `#${log.target_id}` }}</span>
        <span class="text-xs text-text-muted">{{ log.actor }}</span>
        <span class="text-xs text-text-muted w-36 text-right">{{ new Date(log.created_at).toLocaleString() }}</span>
      </div>
    </div>

    <div v-if="totalPages() > 1" class="flex items-center justify-center gap-2 mt-6">
      <button @click="page--; load()" :disabled="page <= 1" class="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm disabled:opacity-30">Prev</button>
      <span class="text-sm text-text-muted">{{ page }} / {{ totalPages() }}</span>
      <button @click="page++; load()" :disabled="page >= totalPages()" class="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm disabled:opacity-30">Next</button>
    </div>
  </div>
</template>
