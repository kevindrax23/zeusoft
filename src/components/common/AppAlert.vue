<template>
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div v-if="show" :class="alertClasses">
      <div class="flex items-start gap-3">
        <component :is="iconComponent" class="h-5 w-5 flex-shrink-0" />
        <div class="flex-1">
          <h4 v-if="title" class="font-semibold mb-1">{{ title }}</h4>
          <p class="text-sm"><slot /></p>
        </div>
        <button
          v-if="closable"
          type="button"
          class="flex-shrink-0 hover:opacity-70 transition-opacity"
          @click="close"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'danger', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const show = ref(props.modelValue)

const close = () => {
  show.value = false
  emit('update:modelValue', false)
  emit('close')
}

const alertClasses = computed(() => {
  const base = 'p-4 rounded-lg border'

  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  return [base, variants[props.variant]].join(' ')
})

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    danger: XCircleIcon,
    info: InformationCircleIcon
  }
  return icons[props.variant]
})
</script>
