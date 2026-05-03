<script setup>
import { ref, onMounted } from 'vue'
import { Play, MessageSquare, Timer, Ban, Filter, Power, GitBranch, Hash, Pencil, X, RotateCcw, Check } from 'lucide-vue-next'
import api from '../api.js'
import { flowNodes } from '../data/flowDefinition.js'

const icons = { play: Play, message: MessageSquare, timer: Timer, ban: Ban, filter: Filter, power: Power, split: GitBranch, hash: Hash }

const messages = ref({})
const defaults = ref({})
const editing = ref(null)
const editValue = ref('')
const saving = ref(false)

async function load() {
  const { data } = await api.get('/settings/messages')
  messages.value = data.messages
  defaults.value = data.defaults
}

function startEdit(key) {
  editing.value = key
  editValue.value = messages.value[key] || ''
}

function cancelEdit() {
  editing.value = null
  editValue.value = ''
}

async function saveEdit(key) {
  saving.value = true
  await api.put(`/settings/messages/${key}`, { value: editValue.value })
  messages.value[key] = editValue.value
  editing.value = null
  saving.value = false
}

async function resetMsg(key) {
  saving.value = true
  const { data } = await api.post(`/settings/messages/${key}/reset`)
  messages.value[key] = data.value
  if (editing.value === key) editValue.value = data.value
  saving.value = false
}

function isDefault(key) {
  return messages.value[key] === defaults.value[key]
}

function truncate(str, len = 60) {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '…' : str
}

onMounted(load)
</script>

<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-semibold mb-2">Workflow</h2>
    <p class="text-text-muted text-sm mb-6">Edit bot responses. Changes take effect immediately.</p>

    <div class="max-w-2xl mx-auto">
      <template v-for="(node, i) in flowNodes" :key="node.id">

        <!-- Check node (has fail branch) -->
        <template v-if="node.type === 'check'">
          <div class="flex gap-3 items-stretch">
            <!-- Main pass card -->
            <div class="flex-1 bg-surface border border-border rounded-xl p-4">
              <div class="flex items-center gap-2 mb-1">
                <component :is="icons[node.icon]" :size="16" class="text-primary shrink-0" />
                <span class="text-sm font-medium">{{ node.label }}</span>
              </div>
              <p class="text-xs text-text-muted">{{ node.description }}</p>
            </div>

            <!-- Connector arm -->
            <div class="flex items-center shrink-0">
              <div class="w-6 border-t-2 border-dashed border-danger/40"></div>
            </div>

            <!-- Fail response card -->
            <div class="w-48 sm:w-64 bg-surface border border-danger/30 rounded-xl p-3 relative">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[11px] uppercase text-danger font-medium">{{ node.failLabel }}</span>
                <button @click="startEdit(node.settingKey)" class="p-1 rounded text-text-muted hover:text-text active:scale-90 transition-all">
                  <Pencil :size="13" />
                </button>
              </div>
              <p class="text-xs text-text-muted break-words">{{ truncate(messages[node.settingKey], 50) }}</p>

              <!-- Inline editor -->
              <div v-if="editing === node.settingKey" class="mt-3 space-y-2">
                <textarea v-model="editValue" rows="3" class="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"></textarea>
                <div class="flex gap-2">
                  <button @click="saveEdit(node.settingKey)" :disabled="saving" class="flex items-center gap-1 bg-primary text-white px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-all">
                    <Check :size="12" /> Save
                  </button>
                  <button @click="cancelEdit" class="px-2.5 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95 transition-all">
                    <X :size="12" />
                  </button>
                  <button v-if="!isDefault(node.settingKey)" @click="resetMsg(node.settingKey)" class="px-2.5 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95 transition-all" title="Reset to default">
                    <RotateCcw :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Branch node (moderation) -->
        <template v-else-if="node.type === 'branch'">
          <div class="bg-surface border border-border rounded-xl p-4 mb-1">
            <div class="flex items-center gap-2 mb-1">
              <component :is="icons[node.icon]" :size="16" class="text-primary shrink-0" />
              <span class="text-sm font-medium">{{ node.label }}</span>
            </div>
            <p class="text-xs text-text-muted">{{ node.description }}</p>
          </div>

          <!-- Fork connector -->
          <div class="flex justify-center py-1">
            <div class="w-0.5 h-3 bg-border"></div>
          </div>

          <!-- Two branch cards -->
          <div class="grid grid-cols-2 gap-3 mb-1">
            <div v-for="branch in node.branches" :key="branch.settingKey" class="bg-surface border border-primary/20 rounded-xl p-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-primary-hover">{{ branch.label }}</span>
                <button @click="startEdit(branch.settingKey)" class="p-1 rounded text-text-muted hover:text-text active:scale-90 transition-all">
                  <Pencil :size="13" />
                </button>
              </div>
              <p class="text-xs text-text-muted break-words">{{ truncate(messages[branch.settingKey], 40) }}</p>
              <p v-if="branch.hint" class="text-[10px] text-text-muted/60 mt-1">{{ branch.hint }}</p>

              <div v-if="editing === branch.settingKey" class="mt-3 space-y-2">
                <textarea v-model="editValue" rows="2" class="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary resize-none"></textarea>
                <div class="flex gap-2">
                  <button @click="saveEdit(branch.settingKey)" :disabled="saving" class="flex items-center gap-1 bg-primary text-white px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-all">
                    <Check :size="12" /> Save
                  </button>
                  <button @click="cancelEdit" class="px-2.5 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95">
                    <X :size="12" />
                  </button>
                  <button v-if="!isDefault(branch.settingKey)" @click="resetMsg(branch.settingKey)" class="px-2.5 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95" title="Reset">
                    <RotateCcw :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Trigger / Format / Endpoint node (has editable message) -->
        <template v-else>
          <div class="bg-surface border border-border rounded-xl p-4" :class="{ 'border-primary/20': node.type === 'format' }">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <component :is="icons[node.icon]" :size="16" class="text-primary shrink-0" />
                <span class="text-sm font-medium">{{ node.label }}</span>
              </div>
              <button v-if="node.settingKey" @click="startEdit(node.settingKey)" class="p-1.5 rounded text-text-muted hover:text-text active:scale-90 transition-all">
                <Pencil :size="14" />
              </button>
            </div>
            <p class="text-xs text-text-muted">{{ node.description }}</p>
            <p v-if="node.settingKey" class="text-xs text-text mt-2 bg-bg rounded-lg px-3 py-2 break-words">{{ truncate(messages[node.settingKey], 80) }}</p>
            <p v-if="node.hint" class="text-[10px] text-text-muted/60 mt-1">{{ node.hint }}</p>

            <div v-if="editing === node.settingKey" class="mt-3 space-y-2">
              <textarea v-model="editValue" rows="3" class="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-y"></textarea>
              <div class="flex gap-2">
                <button @click="saveEdit(node.settingKey)" :disabled="saving" class="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-all">
                  <Check :size="12" /> Save
                </button>
                <button @click="cancelEdit" class="px-3 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95 transition-all">
                  <X :size="12" />
                </button>
                <button v-if="!isDefault(node.settingKey)" @click="resetMsg(node.settingKey)" class="px-3 py-1.5 border border-border rounded-lg text-xs text-text-muted active:scale-95 transition-all" title="Reset to default">
                  <RotateCcw :size="12" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Connector line between nodes -->
        <div v-if="i < flowNodes.length - 1 && node.type !== 'branch'" class="flex justify-center py-1">
          <div class="w-0.5 h-5 bg-border"></div>
        </div>
        <div v-if="node.type === 'branch'" class="flex justify-center py-1">
          <div class="w-0.5 h-5 bg-border"></div>
        </div>

      </template>
    </div>
  </div>
</template>
