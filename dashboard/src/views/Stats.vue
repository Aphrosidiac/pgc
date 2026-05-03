<script setup>
import { ref, onMounted } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler } from 'chart.js'
import api from '../api.js'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler)

const stats = ref({ total: 0, approved: 0, rejected: 0, pending: 0, banned: 0 })
const dailyData = ref(null)
const hourlyData = ref(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#2a2e3f' }, ticks: { color: '#8b92a8', maxRotation: 45 } },
    y: { grid: { color: '#2a2e3f' }, ticks: { color: '#8b92a8' } },
  },
}

onMounted(async () => {
  const [overview, daily, hourly] = await Promise.all([
    api.get('/stats/overview'),
    api.get('/stats/daily'),
    api.get('/stats/hourly'),
  ])

  stats.value = overview.data

  dailyData.value = {
    labels: daily.data.map(d => d.date?.slice(5)),
    datasets: [{
      data: daily.data.map(d => d.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.3,
    }],
  }

  hourlyData.value = {
    labels: hourly.data.map(d => `${d.hour}:00`),
    datasets: [{
      data: hourly.data.map(d => d.count),
      backgroundColor: '#6366f1',
      borderRadius: 4,
    }],
  }
})

const cards = [
  { key: 'total', label: 'Total', color: 'text-primary' },
  { key: 'approved', label: 'Approved', color: 'text-success' },
  { key: 'rejected', label: 'Rejected', color: 'text-danger' },
  { key: 'pending', label: 'Pending', color: 'text-warning' },
]
</script>

<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Statistics</h2>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div v-for="c in cards" :key="c.key" class="bg-surface border border-border rounded-xl p-3 sm:p-4">
        <p class="text-[11px] sm:text-xs text-text-muted uppercase">{{ c.label }}</p>
        <p class="text-xl sm:text-2xl font-semibold mt-1" :class="c.color">{{ stats[c.key] }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-surface border border-border rounded-xl p-4 sm:p-5">
        <h3 class="text-sm font-medium text-text-muted mb-4">Daily Confessions (30 days)</h3>
        <div class="h-40 sm:h-48">
          <Line v-if="dailyData" :data="dailyData" :options="chartOptions" />
        </div>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4 sm:p-5">
        <h3 class="text-sm font-medium text-text-muted mb-4">By Hour</h3>
        <div class="h-40 sm:h-48">
          <Bar v-if="hourlyData" :data="hourlyData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
