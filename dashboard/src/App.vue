<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Inbox, ListOrdered, Users, Filter, BarChart3, ScrollText, LogOut } from 'lucide-vue-next'
import api from './api.js'

const router = useRouter()
const route = useRoute()
const user = ref(null)

const nav = [
  { path: '/', label: 'Queue', icon: Inbox },
  { path: '/feed', label: 'Feed', icon: ListOrdered },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/filters', label: 'Filters', icon: Filter },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/logs', label: 'Logs', icon: ScrollText },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/auth/me')
    user.value = data
  } catch {
    if (route.path !== '/login') router.push('/login')
  }
})

async function logout() {
  await api.post('/auth/logout')
  user.value = null
  router.push('/login')
}
</script>

<template>
  <div v-if="route.path === '/login'">
    <router-view />
  </div>
  <div v-else class="flex h-screen">
    <aside class="w-56 bg-surface border-r border-border flex flex-col">
      <div class="p-5 border-b border-border">
        <h1 class="text-lg font-semibold">Pagoh Confess</h1>
        <p class="text-xs text-text-muted mt-0.5">Admin Dashboard</p>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <router-link
          v-for="item in nav"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="route.path === item.path ? 'bg-primary/15 text-primary-hover font-medium' : 'text-text-muted hover:bg-surface-hover hover:text-text'"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </router-link>
      </nav>
      <div class="p-3 border-t border-border">
        <button @click="logout" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-hover hover:text-text w-full transition-colors">
          <LogOut :size="18" />
          Logout
        </button>
      </div>
    </aside>
    <main class="flex-1 overflow-y-auto p-6">
      <router-view />
    </main>
  </div>
</template>
