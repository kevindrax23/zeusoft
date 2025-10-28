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

        <select v-model="filters.estado" class="input">
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
      <AppTable
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
            <p class="font-medium text-gray-900">{{ item.cliente.nombre }}</p>
            <p class="text-sm text-gray-500">{{ item.cliente.numeroDocumento }}</p>
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
//import { useInvoicesStore } from '@/stores/invoices'
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
//const invoicesStore = useInvoicesStore()

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
    cliente: { nombre: 'Juan Pérez', numeroDocumento: '12345678' },
    fecha: '2025-10-20',
    subtotal: 1000.00,
    total: 1180.00,
    estado: 'pagada'
  },
  {
    _id: '2',
    numeroFactura: 'FAC-000122',
    cliente: { nombre: 'María García', numeroDocumento: '87654321' },
    fecha: '2025-10-18',
    subtotal: 750.00,
    total: 885.00,
    estado: 'pendiente'
  },
  {
    _id: '3',
    numeroFactura: 'FAC-000121',
    cliente: { nombre: 'Carlos López', numeroDocumento: '11223344' },
    fecha: '2025-10-15',
    subtotal: 1500.00,
    total: 1770.00,
    estado: 'pagada'
  }
])

const filteredInvoices = computed(() => {
  let result = invoices.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(i =>
      i.numeroFactura.toLowerCase().includes(search) ||
      i.cliente.nombre.toLowerCase().includes(search)
    )
  }

  if (filters.value.estado) {
    result = result.filter(i => i.estado === filters.value.estado)
  }

  return result
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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

const downloadInvoice = (invoice) => {
  console.log('Descargando factura:', invoice.numeroFactura)
  // Implementar descarga de PDF
}

const confirmCancel = async (invoice) => {
  if (confirm(`¿Está seguro de anular la factura ${invoice.numeroFactura}?`)) {
    try {
      // Implementar anulación
      console.log('Anulando factura:', invoice)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

onMounted(() => {
  // invoicesStore.fetchInvoices()
})
</script>
