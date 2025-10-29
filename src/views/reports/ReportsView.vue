<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
        <p class="text-gray-600 mt-1">Análisis y reportes de tu negocio</p>
      </div>
      <AppButton variant="primary" :icon-left="ArrowDownTrayIcon">
        Exportar Reporte
      </AppButton>
    </div>

    <!-- Period Filter -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          v-model="selectedPeriod"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
          <option value="custom">Personalizado</option>
        </select>

        <AppInput
          v-model="dateRange.start"
          type="date"
          placeholder="Fecha inicio"
          :disabled="selectedPeriod !== 'custom'"
        />

        <AppInput
          v-model="dateRange.end"
          type="date"
          placeholder="Fecha fin"
          :disabled="selectedPeriod !== 'custom'"
        />

        <AppButton variant="secondary" :icon-left="FunnelIcon" @click="applyFilters">
          Filtrar
        </AppButton>
      </div>
    </AppCard>

    <!-- Main Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Ventas Totales</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatCurrency(stats.totalSales) }}</p>
            <p class="text-xs text-green-600 mt-1 flex items-center">
              <ArrowTrendingUpIcon class="h-3 w-3 mr-1" />
              +12.5% vs mes anterior
            </p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Facturas Emitidas</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalInvoices }}</p>
            <p class="text-xs text-blue-600 mt-1 flex items-center">
              <DocumentTextIcon class="h-3 w-3 mr-1" />
              {{ stats.invoicesPaid }} pagadas
            </p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Productos Vendidos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.productsSold }}</p>
            <p class="text-xs text-purple-600 mt-1 flex items-center">
              <CubeIcon class="h-3 w-3 mr-1" />
              {{ stats.uniqueProducts }} únicos
            </p>
          </div>
          <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CubeIcon class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes Nuevos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.newCustomers }}</p>
            <p class="text-xs text-orange-600 mt-1 flex items-center">
              <UsersIcon class="h-3 w-3 mr-1" />
              Total: {{ stats.totalCustomers }}
            </p>
          </div>
          <div class="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <UsersIcon class="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Chart -->
      <AppCard title="Ventas por Mes" subtitle="Últimos 6 meses">
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <ChartBarIcon class="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">Gráfico de ventas</p>
            <p class="text-sm text-gray-400">Implementar con Chart.js o similar</p>
          </div>
        </div>
      </AppCard>

      <!-- Top Products Chart -->
      <AppCard title="Productos Más Vendidos" subtitle="Top 5 del período">
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <ChartPieIcon class="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">Gráfico de productos</p>
            <p class="text-sm text-gray-400">Implementar con Chart.js o similar</p>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Top Products Table -->
    <AppCard title="Productos Más Vendidos">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ index + 1 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CubeIcon class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <p class="font-medium text-gray-900">{{ product.name }}</p>
                    <p class="text-sm text-gray-500">{{ product.code }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-900">{{ product.units }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-green-600">{{ formatCurrency(product.revenue) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Recent Invoices -->
    <AppCard title="Últimas Facturas" subtitle="Últimas 5 transacciones">
      <div class="space-y-4">
        <div
          v-for="invoice in recentInvoices"
          :key="invoice.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ invoice.number }}</p>
              <p class="text-sm text-gray-500">{{ invoice.customer }} - {{ formatDate(invoice.date) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(invoice.total) }}</p>
            <AppBadge :variant="getStatusVariant(invoice.status)" size="sm">
              {{ getStatusLabel(invoice.status) }}
            </AppBadge>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

const selectedPeriod = ref('month')
const dateRange = ref({
  start: '',
  end: ''
})

const stats = ref({
  totalSales: 125480.50,
  totalInvoices: 156,
  invoicesPaid: 142,
  productsSold: 1245,
  uniqueProducts: 67,
  newCustomers: 23,
  totalCustomers: 189
})

const topProducts = ref([
  {
    id: 1,
    code: 'PROD-001',
    name: 'Laptop Dell XPS 15',
    category: 'electrónica',
    units: 45,
    revenue: 67500.00
  },
  {
    id: 2,
    code: 'PROD-002',
    name: 'Mouse Logitech MX',
    category: 'electrónica',
    units: 120,
    revenue: 12000.00
  },
  {
    id: 3,
    code: 'PROD-003',
    name: 'Teclado Mecánico',
    category: 'electrónica',
    units: 89,
    revenue: 13350.00
  },
  {
    id: 4,
    code: 'PROD-004',
    name: 'Monitor Samsung 27"',
    category: 'electrónica',
    units: 67,
    revenue: 40200.00
  },
  {
    id: 5,
    code: 'PROD-005',
    name: 'Webcam HD',
    category: 'electrónica',
    units: 156,
    revenue: 23400.00
  }
])

const recentInvoices = ref([
  {
    id: 1,
    number: 'FAC-000123',
    customer: 'Juan Pérez',
    date: '2025-10-28',
    total: 1180.00,
    status: 'pagada'
  },
  {
    id: 2,
    number: 'FAC-000122',
    customer: 'María García',
    date: '2025-10-27',
    total: 885.00,
    status: 'pendiente'
  },
  {
    id: 3,
    number: 'FAC-000121',
    customer: 'Carlos López',
    date: '2025-10-26',
    total: 1770.00,
    status: 'pagada'
  },
  {
    id: 4,
    number: 'FAC-000120',
    customer: 'Ana Torres',
    date: '2025-10-25',
    total: 2350.00,
    status: 'pagada'
  },
  {
    id: 5,
    number: 'FAC-000119',
    customer: 'Luis Martínez',
    date: '2025-10-24',
    total: 950.00,
    status: 'pendiente'
  }
])

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

const applyFilters = () => {
  console.log('Aplicando filtros:', {
    period: selectedPeriod.value,
    dateRange: dateRange.value
  })
  // Implementar lógica de filtrado
}

onMounted(() => {
  console.log('ReportsView montado correctamente')
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
