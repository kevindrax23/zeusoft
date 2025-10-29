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
      <div v-if="filteredInvoices.length === 0" class="text-center py-12">
        <p class="text-gray-500">No hay facturas disponibles</p>
      </div>
      <AppTable
        v-else
        :columns="columns"
        :data="filteredInvoices"
        empty-message="No hay facturas disponibles"
      >
        <template #cell-numeroFactura="{ value, item }">
          <button
            @click="router.push(`/facturas/${item._id}`)"
            class="font-mono font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {{ value }}
          </button>
        </template>

        <template #cell-cliente="{ item }">
          <div>
            <p class="font-medium text-gray-900">{{ item.cliente?.nombre || 'N/A' }}</p>
            <p class="text-sm text-gray-500">{{ item.cliente?.numeroDocumento || 'N/A' }}</p>
          </div>
        </template>

        <template #cell-fecha="{ value }">
          <span class="text-sm text-gray-700">{{ formatDate(value) }}</span>
        </template>

        <template #cell-total="{ value }">
          <span class="font-semibold text-gray-900">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-estado="{ value }">
          <AppBadge :variant="getStatusVariant(value)">
            {{ getStatusLabel(value) }}
          </AppBadge>
        </template>

        <template #actions="{ item }">
          <div class="flex items-center gap-2">
            <button
              class="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              @click="router.push(`/facturas/${item._id}`)"
              title="Ver detalles"
            >
              <EyeIcon class="h-5 w-5" />
            </button>
            <button
              v-if="item.estado !== 'anulada'"
              class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              @click="downloadInvoice(item)"
              title="Descargar PDF"
            >
              <ArrowDownTrayIcon class="h-5 w-5" />
            </button>
            <button
              v-if="item.estado === 'pendiente'"
              class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              @click="confirmCancel(item)"
              title="Anular factura"
            >
              <XCircleIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useInvoicesStore } from '@/stores/invoices'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
// const invoicesStore = useInvoicesStore()

const filters = ref({
  search: '',
  estado: '',
  fechaInicio: '',
  fechaFin: ''
})

const stats = ref({
  totalFacturado: 125480.50,
  pendientes: 12,
  pagadas: 45,
  anuladas: 3
})

const columns = [
  { key: 'numeroFactura', label: 'N° Factura' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'total', label: 'Total' },
  { key: 'estado', label: 'Estado' }
]

// Datos de ejemplo
const invoices = ref([
  {
    _id: '1',
    numeroFactura: 'FAC-000123',
    cliente: {
      nombre: 'Juan Pérez',
      numeroDocumento: '12345678'
    },
    fecha: '2025-10-20',
    subtotal: 1000.00,
    total: 1180.00,
    estado: 'pagada'
  },
  {
    _id: '2',
    numeroFactura: 'FAC-000122',
    cliente: {
      nombre: 'María García',
      numeroDocumento: '87654321'
    },
    fecha: '2025-10-18',
    subtotal: 750.00,
    total: 885.00,
    estado: 'pendiente'
  },
  {
    _id: '3',
    numeroFactura: 'FAC-000121',
    cliente: {
      nombre: 'Carlos López',
      numeroDocumento: '11223344'
    },
    fecha: '2025-10-15',
    subtotal: 1500.00,
    total: 1770.00,
    estado: 'pagada'
  }
])

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
  if (!status) return 'gray'
  const variants = {
    pagada: 'success',
    pendiente: 'warning',
    anulada: 'danger'
  }
  return variants[status] || 'gray'
}

const getStatusLabel = (status) => {
  if (!status) return 'N/A'
  const labels = {
    pagada: 'Pagada',
    pendiente: 'Pendiente',
    anulada: 'Anulada'
  }
  return labels[status] || status
}

const downloadInvoice = (invoice) => {
  if (!invoice) return
  console.log('Descargando factura:', invoice.numeroFactura)
  alert(`Descargando factura: ${invoice.numeroFactura}`)
}

const confirmCancel = async (invoice) => {
  if (!invoice) return
  if (confirm(`¿Está seguro de anular la factura ${invoice.numeroFactura}?`)) {
    try {
      console.log('Anulando factura:', invoice)
      invoice.estado = 'anulada'
      alert('Factura anulada correctamente')
    } catch (err) {
      console.error('Error al anular factura:', err)
      alert('Error al anular la factura')
    }
  }
}

onMounted(() => {
  // invoicesStore.fetchInvoices()
  console.log('InvoicesView montado correctamente')
  console.log('Facturas cargadas:', invoices.value.length)
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
