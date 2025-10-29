<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Análisis y reportes de tu negocio</p>
      </div>
      <AppButton
        variant="primary"
        :icon-left="ArrowDownTrayIcon"
        @click="handleExportReport"
        :loading="exporting"
        :disabled="loading || exporting"
      >
        Exportar Reporte
      </AppButton>
    </div>

    <!-- Period Filter -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          v-model="selectedPeriod"
          @change="handlePeriodChange"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
          <option value="custom">Personalizado</option>
        </select>

        <input
          v-model="dateRange.start"
          type="date"
          :disabled="selectedPeriod !== 'custom'"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <input
          v-model="dateRange.end"
          type="date"
          :disabled="selectedPeriod !== 'custom'"
          class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <AppButton
          variant="secondary"
          :icon-left="FunnelIcon"
          @click="applyFilters"
          :loading="loading"
          :disabled="selectedPeriod !== 'custom' || !dateRange.start || !dateRange.end"
        >
          Filtrar
        </AppButton>
      </div>

      <!-- Filtro activo -->
      <div v-if="activeFilter" class="mt-4 flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Filtro activo:</span>
        <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
          {{ activeFilter }}
        </span>
      </div>
    </AppCard>

    <!-- Main Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ formatCurrency(stats.totalSales) }}</p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
              <ArrowTrendingUpIcon class="h-3 w-3 mr-1" />
              Total facturado
            </p>
          </div>
          <div class="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Facturas Emitidas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalInvoices }}</p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
              <DocumentTextIcon class="h-3 w-3 mr-1" />
              {{ stats.paidInvoices }} pagadas
            </p>
          </div>
          <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <DocumentTextIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Productos Vendidos</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.productsSold }}</p>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center">
              <CubeIcon class="h-3 w-3 mr-1" />
              {{ stats.uniqueProducts }} únicos
            </p>
          </div>
          <div class="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <CubeIcon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Clientes Activos</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stats.totalCustomers }}</p>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center">
              <UsersIcon class="h-3 w-3 mr-1" />
              Con compras
            </p>
          </div>
          <div class="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <UsersIcon class="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AppCard title="Ventas por Mes" subtitle="Últimos 6 meses">
        <div class="h-64">
          <SalesLineChart v-if="salesChartData.length > 0" :data="salesChartData" />
          <div v-else class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <ChartBarIcon class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No hay datos de ventas</p>
            </div>
          </div>
        </div>
      </AppCard>

      <AppCard title="Productos Más Vendidos" subtitle="Top 5 del período">
        <div class="h-64">
          <ProductsPieChart v-if="topProducts.length > 0" :data="topProducts" />
          <div v-else class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-center">
              <ChartPieIcon class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No hay datos de productos</p>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Top Products Table -->
    <AppCard title="Productos Más Vendidos">
      <div v-if="topProducts.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">No hay datos de productos vendidos</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unidades</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(product, index) in topProducts" :key="product._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ index + 1 }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <CubeIcon class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <p class="font-medium text-gray-900 dark:text-white">{{ product.nombre }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.codigo }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{{ product.categoria }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ product.cantidadVendida }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-green-600 dark:text-green-400">{{ formatCurrency(product.ingresos) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Recent Invoices -->
    <AppCard title="Últimas Facturas" subtitle="Últimas 5 transacciones">
      <div v-if="recentInvoices.length === 0" class="text-center py-8">
        <DocumentTextIcon class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400">No hay facturas registradas</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="invoice in recentInvoices"
          :key="invoice._id"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          @click="router.push(`/facturas/${invoice._id}`)"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ invoice.numeroFactura }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ invoice.cliente?.nombre }} - {{ formatDate(invoice.fechaEmision) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900 dark:text-white">{{ formatCurrency(invoice.total) }}</p>
            <AppBadge :variant="getStatusVariant(invoice.estado)" size="sm">
              {{ getStatusLabel(invoice.estado) }}
            </AppBadge>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { formatCurrency, formatDate } from '@/config/settings'
import { exportReportToExcel } from '@/utils/excelExporter'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import SalesLineChart from '@/components/charts/SalesLineChart.vue'
import ProductsPieChart from '@/components/charts/ProductsPieChart.vue'
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

const router = useRouter()

const selectedPeriod = ref('month')
const dateRange = ref({ start: '', end: '' })

const stats = ref({
  totalSales: 0,
  totalInvoices: 0,
  paidInvoices: 0,
  productsSold: 0,
  uniqueProducts: 0,
  totalCustomers: 0
})

const topProducts = ref([])
const recentInvoices = ref([])
const salesChartData = ref([])
const activeFilter = ref('Este Mes')
const loading = ref(false)
const exporting = ref(false)

const fullReportData = ref({
  invoices: [],
  topProducts: [],
  monthlySales: []
})

const getStatusVariant = (status) => {
  return { pagada: 'success', pendiente: 'warning', anulada: 'danger' }[status] || 'gray'
}

const getStatusLabel = (status) => {
  return { pagada: 'Pagada', pendiente: 'Pendiente', anulada: 'Anulada' }[status] || status
}

const getPeriodLabel = () => {
  const labels = {
    all: 'Todas las fechas',
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    year: 'Este Año',
    custom: `${formatDate(dateRange.value.start)} - ${formatDate(dateRange.value.end)}`
  }
  return labels[selectedPeriod.value]
}

const handlePeriodChange = () => {
  if (selectedPeriod.value !== 'custom') {
    activeFilter.value = getPeriodLabel()
    loadReportsData()
  }
}

const applyFilters = () => {
  if (dateRange.value.start && dateRange.value.end) {
    activeFilter.value = getPeriodLabel()
    loadReportsData()
  }
}

const getDateRange = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = today.getMonth()
  const dd = today.getDate()

  let start, end

  // Usar switch sin const dentro de cada case
  switch (selectedPeriod.value) {
    case 'all':
      return { start: null, end: null }

    case 'today': {
      start = end = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
      break
    }

    case 'week': {
      const weekAgo = new Date(yyyy, mm, dd - 6)
      start = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`
      end = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
      break
    }

    case 'month': {
      start = `${yyyy}-${String(mm + 1).padStart(2, '0')}-01`
      end = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
      break
    }

    case 'year': {
      start = `${yyyy}-01-01`
      end = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
      break
    }

    case 'custom': {
      start = dateRange.value.start
      end = dateRange.value.end
      break
    }

    default: {
      start = `${yyyy}-${String(mm + 1).padStart(2, '0')}-01`
      end = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
    }
  }

  return { start, end }
}

const loadReportsData = async () => {
  try {
    loading.value = true

    const { start, end } = getDateRange()
    const params = {}

    if (start && end) {
      params.fechaInicio = start
      params.fechaFin = end
    }

    const [statsRes, invoicesRes] = await Promise.all([
      api.get('/invoices/stats', { params }),
      api.get('/invoices', { params })
    ])

    const statsData = statsRes.data?.data || statsRes.data || {}
    stats.value.totalSales = statsData.totalSales || 0
    stats.value.totalInvoices = statsData.totalInvoices || 0
    stats.value.paidInvoices = statsData.paidInvoices || 0

    const invoices = invoicesRes.data?.data || invoicesRes.data || []
    fullReportData.value.invoices = invoices
    recentInvoices.value = invoices.slice(0, 5)

    const monthlySales = {}
    let totalProductsSold = 0
    const uniqueProductIds = new Set()
    const productSales = {}
    const activeCustomerIds = new Set()

    invoices.forEach(inv => {
      if (inv.estado !== 'anulada') {
        if (inv.cliente?._id) activeCustomerIds.add(inv.cliente._id)

        inv.items?.forEach(item => {
          totalProductsSold += item.cantidad
          uniqueProductIds.add(item.producto?._id || item.producto)

          const pid = item.producto?._id || item.producto
          if (!productSales[pid]) {
            productSales[pid] = {
              _id: pid,
              nombre: item.nombre,
              codigo: item.codigo,
              categoria: item.producto?.categoria || 'otros',
              cantidadVendida: 0,
              ingresos: 0
            }
          }
          productSales[pid].cantidadVendida += item.cantidad
          productSales[pid].ingresos += item.subtotal
        })

        const fecha = new Date(inv.fechaEmision)
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const mesNombre = fecha.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })

        if (!monthlySales[mesKey]) {
          monthlySales[mesKey] = { mes: mesNombre, total: 0 }
        }
        monthlySales[mesKey].total += inv.total
      }
    })

    stats.value.productsSold = totalProductsSold
    stats.value.uniqueProducts = uniqueProductIds.size
    stats.value.totalCustomers = activeCustomerIds.size

    topProducts.value = Object.values(productSales).sort((a, b) => b.cantidadVendida - a.cantidadVendida).slice(0, 5)
    fullReportData.value.topProducts = topProducts.value

    salesChartData.value = Object.entries(monthlySales)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, data]) => data)
    fullReportData.value.monthlySales = salesChartData.value

  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const handleExportReport = () => {
  try {
    exporting.value = true
    exportReportToExcel(fullReportData.value, {
      periodLabel: activeFilter.value,
      fechaInicio: dateRange.value.start,
      fechaFin: dateRange.value.end
    }, stats.value)
    alert('Reporte exportado exitosamente')
  } catch (err) {
    console.error('Error al exportar:', err)
    alert('Error al exportar el reporte')
  } finally {
    exporting.value = false
  }
}

onMounted(() => loadReportsData())
</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.5s ease-in;
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
