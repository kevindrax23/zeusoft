<template>
  <AppCard :hoverable="false" padding="normal">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ value }}</p>

        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-2">
          <component
            :is="trend >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
            :class="[
              'h-4 w-4',
              trend >= 0 ? 'text-green-500' : 'text-red-500'
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ trendLabel }}
          </span>
        </div>
      </div>

      <div :class="iconContainerClass">
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/common/AppCard.vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  trend: {
    type: Number,
    default: undefined
  },
  trendLabel: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'yellow', 'purple', 'red'].includes(value)
  }
})

const iconContainerClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  }

  return ['h-12 w-12 rounded-lg flex items-center justify-center', colors[props.color]].join(' ')
})
</script>
