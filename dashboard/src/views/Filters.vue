<script setup>
import { ref, onMounted } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import api from '../api.js'

const words = ref([])
const newWord = ref('')

async function load() {
  const { data } = await api.get('/filters')
  words.value = data
}

async function addWord() {
  if (!newWord.value.trim()) return
  await api.post('/filters', { word: newWord.value.trim() })
  newWord.value = ''
  load()
}

async function removeWord(id) {
  await api.delete(`/filters/${id}`)
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Word Filters</h2>

    <form @submit.prevent="addWord" class="flex gap-3 mb-6">
      <input v-model="newWord" placeholder="Add a banned word..."
        class="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" />
      <button type="submit" class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors active:scale-[0.97]">
        <Plus :size="16" />
        <span class="hidden sm:inline">Add</span>
      </button>
    </form>

    <div v-if="!words.length" class="text-text-muted text-sm py-12 text-center">No banned words yet</div>

    <div v-else class="flex flex-wrap gap-2">
      <span v-for="w in words" :key="w.id" class="inline-flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 text-sm">
        {{ w.word }}
        <button @click="removeWord(w.id)" class="text-text-muted hover:text-danger active:scale-[0.9] transition-all p-0.5">
          <X :size="14" />
        </button>
      </span>
    </div>
  </div>
</template>
