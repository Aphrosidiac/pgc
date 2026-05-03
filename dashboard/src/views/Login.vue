<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await api.post('/auth/login', { username: username.value, password: password.value })
    router.push('/')
  } catch {
    error.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <form @submit.prevent="login" class="bg-surface border border-border rounded-xl p-8 w-full max-w-sm space-y-5">
      <div class="text-center">
        <h1 class="text-xl font-semibold">Pagoh Confess</h1>
        <p class="text-sm text-text-muted mt-1">Admin login</p>
      </div>
      <div>
        <input v-model="username" type="text" placeholder="Username" autocomplete="username"
          class="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
      </div>
      <div>
        <input v-model="password" type="password" placeholder="Password" autocomplete="current-password"
          class="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
      </div>
      <p v-if="error" class="text-danger text-sm text-center">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>
