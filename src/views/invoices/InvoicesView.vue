<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Facturas</h1>
        <p class="text-gray-600 mt-1">Gestiona las facturas de tu negocio</p>
      </div>
      <AppButton variant="primary" :icon-left="PlusIcon" @click="router.push('/facturas/crear')">
        Nueva Factura
      </AppButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Facturado</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatCurrency(stats.totalFacturado) }}</p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pendientes</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.pendientes }}</p>
          </div>
          <div class="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pagadas</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.pagadas }}</p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Anuladas</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.anuladas }}</p>
          </div>
          <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircleIcon class="h-6 w-6 text-red-600" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Filters -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppInput
          v-model="filters.search"
          placeholder="Buscar por número o cliente..."
          :icon-left="MagnifyingGlassIcon"
        />

        <select v-model="filters.estado" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </select>

        <AppInput
          v-model="filters.fechaInicio"
          type="date"
          placeholder="Fecha inicio"
        />

        <AppInput
          v-model="filters.fechaFin"
          type="date"
          placeholder="Fecha fin"
        />
      </div>
    </AppCard>

    <!-- Invoices Table -->
    <AppCard title="Lista de Facturas">
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Cargando facturas...</p>
      </div>
      <div v-else-if="filteredInvoices.length === 0" class="text-center py-12">
        <DocumentTextIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No hay facturas disponibles</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Factura</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="invoice in filteredInvoices"
              :key="invoice._id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-mono font-medium text-primary-600">{{ invoice.numeroFactura }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="font-medium text-gray-900">{{ invoice.cliente?.nombre || 'N/A' }}</p>
                  <p class="text-sm text-gray-500">{{ invoice.cliente?.numeroDocumento || 'N/A' }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700">{{ formatDate(invoice.fechaEmision) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-semibold text-gray-900">{{ formatCurrency(invoice.total) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <AppBadge :variant="getStatusVariant(invoice.estado)">
                  {{ getStatusLabel(invoice.estado) }}
                </AppBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    @click="viewInvoice(invoice)"
                    title="Ver detalles"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>
                  <button
                    v-if="invoice.estado === 'pendiente'"
                    class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    @click="markAsPaid(invoice)"
                    title="Marcar como pagada"
                  >
                    <CheckCircleIcon class="h-5 w-5" />
                  </button>
                  <button
                    v-if="invoice.estado === 'pendiente'"
                    class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    @click="cancelInvoice(invoice)"
                    title="Anular factura"
                  >
                    <XCircleIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

const loading = ref(false)
const filters = ref({
  search: '',
  estado: '',
  fechaInicio: '',
  fechaFin: ''
})

const invoices = ref([])
const stats = ref({
  totalFacturado: 0,
  pendientes: 0,
  pagadas: 0,
  anuladas: 0
})

const filteredInvoices = computed(() => {
  let result = [...invoices.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(i => {
      const matchesNumber = i.numeroFactura?.toLowerCase().includes(search)
      const matchesClient = i.cliente?.nombre?.toLowerCase().includes(search)
      return matchesNumber || matchesClient
    })
  }

  if (filters.value.estado) {
    result = result.filter(i => i.estado === filters.value.estado)
  }

  return result
})

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'S/. 0.00'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

const getStatusVariant = (status) => {
  const variants = {
    pagada: 'success',
    pendiente: 'warning',
    anulada: 'danger'
  }
  return variants[status] || 'gray'
}

const getStatusLabel = (status) => {
  const labels = {
    pagada: 'Pagada',
    pendiente: 'Pendiente',
    anulada: 'Anulada'
  }
  return labels[status] || status
}

const loadInvoices = async () => {
  try {
    loading.value = true
    const response = await api.get('/invoices')
    invoices.value = response.data || []
    await loadStats()
  } catch (error) {
    console.error('Error al cargar facturas:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/invoices/stats')
    const data = response.data || {}
    stats.value = {
      totalFacturado: data.totalSales || 0,
      pendientes: data.pendingInvoices || 0,
      pagadas: data.paidInvoices || 0,
      anuladas: data.canceledInvoices || 0
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

const viewInvoice = (invoice) => {
  router.push(`/facturas/${invoice._id}`)
}

const markAsPaid = async (invoice) => {
  if (confirm(`¿Marcar la factura ${invoice.numeroFactura} como pagada?`)) {
    try {
      await api.put(`/invoices/${invoice._id}/status`, { estado: 'pagada' })
      await loadInvoices()
      alert('Factura marcada como pagada')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar la factura')
    }
  }
}

const cancelInvoice = async (invoice) => {
  if (confirm(`¿Está seguro de anular la factura ${invoice.numeroFactura}?`)) {
    try {
      await api.put(`/invoices/${invoice._id}/status`, { estado: 'anulada' })
      await loadInvoices()
      alert('Factura anulada correctamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al anular la factura')
    }
  }
}

onMounted(() => {
  loadInvoices()
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
