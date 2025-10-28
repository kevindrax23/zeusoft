<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm"
        @click.self="closeOnBackdrop && close()"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            :class="modalClasses"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="mt-1 text-sm text-gray-500">
                  {{ subtitle }}
                </p>
              </div>
              <button
                v-if="closable"
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                @click="close"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto" :style="{ maxHeight: maxHeight }">
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: String,
    default: '70vh'
  }
})

const emit = defineEmits(['update:show', 'close'])

const close = () => {
  emit('update:show', false)
  emit('close')
}

const modalClasses = computed(() => {
  const base = 'bg-white rounded-xl shadow-2xl w-full'

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  return [base, sizes[props.size]].join(' ')
})

// Prevenir scroll del body cuando el modal está abierto
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
