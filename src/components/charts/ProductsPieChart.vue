<template>
  <div class="w-full h-full">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'


ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const colors = [
  'rgb(59, 130, 246)',   // Blue
  'rgb(16, 185, 129)',   // Green
  'rgb(251, 146, 60)',   // Orange
  'rgb(168, 85, 247)',   // Purple
  'rgb(236, 72, 153)'    // Pink
]

const chartData = computed(() => ({
  labels: props.data.map(item => item.nombre),
  datasets: [
    {
      data: props.data.map(item => item.cantidadVendida),
      backgroundColor: colors,
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 10
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          return `${label}: ${value} unidades`
        }
      }
    }
  },
  cutout: '65%'
}
</script>
