<template>
  <AppModal
    :show="show"
    @close="$emit('close')"
    title="Enviar Factura por Email"
    subtitle="Envía la factura al cliente"
    size="md"
  >
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Correo Electrónico del Destinatario
        </label>
        <AppInput
          v-model="form.email"
          type="email"
          placeholder="cliente@email.com"
          required
          :error="errors.email"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          La factura será enviada como archivo PDF adjunto
        </p>
      </div>

      <div v-if="invoice" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Detalles de la Factura</h4>
        <div class="space-y-1 text-sm">
          <p class="text-gray-600 dark:text-gray-400">
            <span class="font-medium">Número:</span> {{ invoice.numeroFactura }}
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            <span class="font-medium">Cliente:</span> {{ invoice.cliente?.nombre }}
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            <span class="font-medium">Total:</span> {{ formatCurrency(invoice.total) }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <AppButton type="button" variant="secondary" @click="$emit('close')">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" :loading="loading" :icon-left="PaperAirplaneIcon">
          Enviar Email
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatCurrency } from '@/config/settings'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { PaperAirplaneIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'sent'])

const form = ref({
  email: ''
})

const errors = ref({})
const loading = ref(false)

watch(() => props.invoice, (newInvoice) => {
  if (newInvoice) {
    form.value.email = newInvoice.cliente?.email || ''
  }
}, { immediate: true })

const handleSubmit = async () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
    return
  }

  emit('sent', form.value.email)
}
</script>
