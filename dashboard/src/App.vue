<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Inbox, ListOrdered, Users, Filter, BarChart3, ScrollText, GitBranch, LogOut } from 'lucide-vue-next'
import api from './api.js'

const router = useRouter()
const route = useRoute()
const user = ref(null)

const nav = [
  { path: '/', label: 'Queue', icon: Inbox },
  { path: '/feed', label: 'Feed', icon: ListOrdered },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/filters', label: 'Filters', icon: Filter },
  { path: '/workflow', label: 'Flow', icon: GitBranch },
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
  <div v-else class="flex flex-col md:flex-row h-screen">
    <!-- Desktop sidebar -->
    <aside class="hidden md:flex w-56 bg-surface border-r border-border flex-col shrink-0">
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

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
      <router-view />
    </main>

    <!-- Mobile bottom nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around px-1 py-1 z-50 safe-bottom">
      <router-link
        v-for="item in nav"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[11px] min-w-[3rem] transition-colors"
        :class="route.path === item.path ? 'text-primary-hover' : 'text-text-muted'"
      >
        <component :is="item.icon" :size="20" />
        {{ item.label }}
      </router-link>
      <button @click="logout" class="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[11px] min-w-[3rem] text-text-muted">
        <LogOut :size="20" />
        Out
      </button>
    </nav>
  </div>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: max(0.25rem, env(safe-area-inset-bottom));
}
</style>
