<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="border-b border-gray-100 pb-4 mb-4">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <div :class="bodyClasses">
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-gray-100 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-xl border border-gray-200 transition-all duration-200'
  const shadow = 'shadow-sm'
  const hover = props.hoverable ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' : ''

  const paddings = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8'
  }

  return [base, shadow, hover, paddings[props.padding]].join(' ')
})

const bodyClasses = computed(() => {
  return props.padding === 'none' ? '' : ''
})
</script>
