<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/facturas')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon class="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Detalle de Factura</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Información completa de la factura</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <AppButton
          variant="secondary"
          :icon-left="PrinterIcon"
          :loading="printing"
          :disabled="printing || downloadingPDF || !invoice"
          @click="handlePrint"
        >
          Imprimir
        </AppButton>
        <AppButton
          variant="primary"
          :icon-left="ArrowDownTrayIcon"
          :loading="downloadingPDF"
          :disabled="printing || downloadingPDF || !invoice"
          @click="handleDownloadPDF"
        >
          Descargar PDF
        </AppButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Cargando factura...</p>
    </div>

    <div v-else-if="!invoice" class="text-center py-12">
      <DocumentTextIcon class="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Factura no encontrada</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Contenido Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información de la Factura -->
        <AppCard>
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ invoice.numeroFactura }}</h2>
              <AppBadge :variant="getStatusVariant(invoice.estado)" size="lg">
                {{ getStatusLabel(invoice.estado) }}
              </AppBadge>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600 dark:text-gray-400">Fecha de Emisión</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(invoice.fechaEmision) }}</p>
            </div>
          </div>

          <!-- Información del Cliente -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Información del Cliente</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Nombre / Razón Social</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ invoice.cliente?.nombre || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ invoice.cliente?.tipoDocumento || 'Documento' }}
                </p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ invoice.cliente?.numeroDocumento || 'N/A' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ invoice.cliente?.email || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ invoice.cliente?.telefono || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Productos -->
        <AppCard title="Productos">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(item, index) in invoice.items" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <CubeIcon class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div class="ml-4">
                        <p class="font-medium text-gray-900 dark:text-white">{{ item.nombre }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.codigo }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="font-medium text-gray-900 dark:text-white">{{ item.cantidad }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-gray-900 dark:text-white">{{ formatCurrency(item.precioUnitario) }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(item.subtotal) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppCard>

        <!-- Notas -->
        <AppCard v-if="invoice.notas" title="Notas">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300">{{ invoice.notas }}</p>
          </div>
        </AppCard>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Resumen de Totales -->
        <AppCard title="Resumen de Totales">
          <div class="space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(invoice.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">IVA (19%):</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatCurrency(invoice.montoImpuesto) }}</span>
            </div>
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between">
                <span class="font-semibold text-gray-900 dark:text-white">Total:</span>
                <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {{ formatCurrency(invoice.total) }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Total Productos:</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ totalProductos }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Cantidad Total:</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ cantidadTotal }}</span>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Información Adicional -->
        <AppCard title="Información Adicional">
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">Fecha de Emisión:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(invoice.fechaEmision) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">Creada el:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(invoice.createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 dark:text-gray-400">Última Actualización:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(invoice.updatedAt) }}</span>
            </div>
          </div>
        </AppCard>

        <!-- Acciones -->
        <AppCard title="Acciones">
          <div class="space-y-3">
            <AppButton
              v-if="invoice.estado === 'pendiente'"
              variant="success"
              class="w-full"
              :icon-left="CheckCircleIcon"
              @click="markAsPaid"
            >
              Marcar como Pagada
            </AppButton>

            <AppButton
              v-if="invoice.estado === 'pendiente'"
              variant="danger"
              class="w-full"
              :icon-left="XCircleIcon"
              @click="cancelInvoice"
            >
              Anular Factura
            </AppButton>

            <AppButton
              variant="secondary"
              class="w-full"
              :icon-left="EnvelopeIcon"
              @click="showEmailModal = true"
            >
              Enviar por Email
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Modal de Email -->
    <SendEmailModal
      :show="showEmailModal"
      :invoice="invoice"
      @close="showEmailModal = false"
      @sent="handleSendEmail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import { downloadInvoicePDF, printInvoice } from '@/utils/pdfGenerator'
import { formatCurrency, formatDate, formatDateTime } from '@/config/settings'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import SendEmailModal from '@/components/invoices/SendEmailModal.vue'
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const invoice = ref(null)
const loading = ref(false)
const downloadingPDF = ref(false)
const printing = ref(false)
const showEmailModal = ref(false)

const totalProductos = computed(() => {
  return invoice.value?.items?.length || 0
})

const cantidadTotal = computed(() => {
  return invoice.value?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0
})

const getStatusVariant = (status) => {
  const variants = {
    pagada: 'success',
    pendiente: 'warning',
    anulada: 'danger',
  }
  return variants[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    pagada: 'Pagada',
    pendiente: 'Pendiente',
    anulada: 'Anulada',
  }
  return labels[status] || status
}

const loadInvoice = async () => {
  try {
    loading.value = true
    const invoiceId = route.params.id
    const response = await api.get(`/invoices/${invoiceId}`)
    invoice.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar factura:', error)
    alert('Error al cargar la factura')
  } finally {
    loading.value = false
  }
}

const handlePrint = async () => {
  if (!invoice.value) return

  try {
    printing.value = true
    await printInvoice(invoice.value)
  } catch (error) {
    console.error('Error al imprimir:', error)
    alert('Error al imprimir la factura. Por favor, intente nuevamente.')
  } finally {
    printing.value = false
  }
}

const handleDownloadPDF = async () => {
  if (!invoice.value) return

  try {
    downloadingPDF.value = true
    await downloadInvoicePDF(invoice.value)
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    alert('Error al descargar el PDF. Por favor, intente nuevamente.')
  } finally {
    downloadingPDF.value = false
  }
}

const handleSendEmail = async (email) => {
  try {
    await api.post(`/invoices/${invoice.value._id}/send-email`, { email })
    showEmailModal.value = false
    alert(`Email enviado exitosamente a ${email}`)
  } catch (error) {
    console.error('Error al enviar email:', error)
    const errorMessage = error.response?.data?.mensaje || 'Error al enviar el email. Por favor, intente nuevamente.'
    alert(errorMessage)
  }
}

const markAsPaid = async () => {
  if (confirm(`¿Marcar la factura ${invoice.value.numeroFactura} como pagada?`)) {
    try {
      await api.put(`/invoices/${invoice.value._id}/status`, { estado: 'pagada' })
      await loadInvoice()
      alert('Factura marcada como pagada')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar la factura')
    }
  }
}

const cancelInvoice = async () => {
  if (confirm(`¿Está seguro de anular la factura ${invoice.value.numeroFactura}?`)) {
    try {
      await api.put(`/invoices/${invoice.value._id}/status`, { estado: 'anulada' })
      await loadInvoice()
      alert('Factura anulada correctamente. El stock ha sido devuelto.')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al anular la factura')
    }
  }
}

onMounted(() => {
  loadInvoice()
})
</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
