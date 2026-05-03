<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../api.js'

const confessions = ref([])
const total = ref(0)
const page = ref(1)
const status = ref('all')
const search = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await api.get('/confessions', { params: { status: status.value, page: page.value, limit: 20, search: search.value } })
  confessions.value = data.rows
  total.value = data.total
  loading.value = false
}

const tabs = ['all', 'pending', 'approved', 'rejected']

watch([status, page], load)
onMounted(load)

function doSearch() {
  page.value = 1
  load()
}

const totalPages = () => Math.ceil(total.value / 20)

function statusColor(s) {
  if (s === 'approved') return 'text-success bg-success/15'
  if (s === 'rejected') return 'text-danger bg-danger/15'
  return 'text-warning bg-warning/15'
}
</script>

<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Confession Feed</h2>

    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
      <div class="flex bg-surface border border-border rounded-lg overflow-hidden overflow-x-auto">
        <button v-for="t in tabs" :key="t" @click="status = t; page = 1"
          class="px-3 sm:px-4 py-2 text-sm capitalize transition-colors whitespace-nowrap"
          :class="status === t ? 'bg-primary/15 text-primary-hover font-medium' : 'text-text-muted hover:text-text'">
          {{ t }}
        </button>
      </div>
      <input v-model="search" @keyup.enter="doSearch" placeholder="Search..."
        class="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary w-full sm:flex-1 sm:min-w-48" />
    </div>

    <div v-if="loading" class="text-text-muted text-sm">Loading...</div>
    <div v-else-if="!confessions.length" class="text-text-muted text-sm py-12 text-center">No confessions found</div>

    <div v-else class="space-y-2">
      <div v-for="c in confessions" :key="c.id" class="bg-surface border border-border rounded-lg px-3 sm:px-4 py-3">
        <div class="flex items-start sm:items-center gap-3">
          <span class="text-xs font-mono text-text-muted shrink-0">#{{ c.confession_number || c.id }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm truncate">{{ c.content || '(photo)' }}</p>
            <div class="flex items-center gap-2 mt-1 sm:hidden">
              <span :class="statusColor(c.status)" class="text-xs px-2 py-0.5 rounded capitalize">{{ c.status }}</span>
              <span class="text-xs text-text-muted">{{ new Date(c.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
          <span :class="statusColor(c.status)" class="hidden sm:inline text-xs px-2 py-0.5 rounded capitalize shrink-0">{{ c.status }}</span>
          <span class="hidden sm:inline text-xs text-text-muted shrink-0">{{ new Date(c.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>

    <div v-if="totalPages() > 1" class="flex items-center justify-center gap-2 mt-6">
      <button @click="page--" :disabled="page <= 1" class="px-4 py-2 rounded-lg bg-surface border border-border text-sm disabled:opacity-30 active:scale-[0.97]">Prev</button>
      <span class="text-sm text-text-muted">{{ page }} / {{ totalPages() }}</span>
      <button @click="page++" :disabled="page >= totalPages()" class="px-4 py-2 rounded-lg bg-surface border border-border text-sm disabled:opacity-30 active:scale-[0.97]">Next</button>
    </div>
  </div>
</template>
