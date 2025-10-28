<template>
  <span :class="badgeClasses">
    <component v-if="icon" :is="icon" class="h-3.5 w-3.5" />
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'gray',
    validator: (value) => ['gray', 'success', 'warning', 'danger', 'info', 'primary'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: Object,
    default: null
  }
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-full'

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const variants = {
    gray: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-primary-100 text-primary-700'
  }

  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>
