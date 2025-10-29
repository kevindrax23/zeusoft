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
          @change="applyFilters"
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
              Total facturado
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
              {{ stats.paidInvoices }} pagadas
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
            <p class="text-sm text-gray-600">Clientes Activos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalCustomers }}</p>
            <p class="text-xs text-orange-600 mt-1 flex items-center">
              <UsersIcon class="h-3 w-3 mr-1" />
              Con compras
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
        <div class="h-64">
          <SalesLineChart v-if="salesChartData.length > 0" :data="salesChartData" />
          <div v-else class="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <ChartBarIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">No hay datos de ventas</p>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Top Products Chart -->
      <AppCard title="Productos Más Vendidos" subtitle="Top 5 del período">
        <div class="h-64">
          <ProductsPieChart v-if="topProducts.length > 0" :data="topProducts" />
          <div v-else class="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div class="text-center">
              <ChartPieIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">No hay datos de productos</p>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Top Products Table -->
    <AppCard title="Productos Más Vendidos">
      <div v-if="topProducts.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay datos de productos vendidos</p>
      </div>
      <div v-else class="overflow-x-auto">
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
              :key="product._id"
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
                    <p class="font-medium text-gray-900">{{ product.nombre }}</p>
                    <p class="text-sm text-gray-500">{{ product.codigo }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ product.categoria }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-900">{{ product.cantidadVendida }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-semibold text-green-600">{{ formatCurrency(product.ingresos) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Recent Invoices -->
    <AppCard title="Últimas Facturas" subtitle="Últimas 5 transacciones">
      <div v-if="recentInvoices.length === 0" class="text-center py-8">
        <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">No hay facturas registradas</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="invoice in recentInvoices"
          :key="invoice._id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          @click="router.push(`/facturas/${invoice._id}`)"
        >
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ invoice.numeroFactura }}</p>
              <p class="text-sm text-gray-500">{{ invoice.cliente?.nombre }} - {{ formatDate(invoice.fechaEmision) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(invoice.total) }}</p>
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
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
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
const dateRange = ref({
  start: '',
  end: ''
})

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

const loadStats = async () => {
  try {
    const response = await api.get('/invoices/stats')
    const data = response.data || {}

    stats.value = {
      totalSales: data.totalSales || 0,
      totalInvoices: data.totalInvoices || 0,
      paidInvoices: data.paidInvoices || 0,
      productsSold: 0,
      uniqueProducts: 0,
      totalCustomers: 0
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

const loadRecentInvoices = async () => {
  try {
    const response = await api.get('/invoices')
    const invoices = response.data || []

    recentInvoices.value = invoices.slice(0, 5)

    let totalProductsSold = 0
    const uniqueProductIds = new Set()
    const productSales = {}
    const monthlySales = {}

    invoices.forEach(invoice => {
      if (invoice.estado !== 'anulada') {
        // Productos
        invoice.items?.forEach(item => {
          totalProductsSold += item.cantidad
          uniqueProductIds.add(item.producto?._id || item.producto)

          const productId = item.producto?._id || item.producto
          if (!productSales[productId]) {
            productSales[productId] = {
              _id: productId,
              nombre: item.nombre,
              codigo: item.codigo,
              categoria: item.producto?.categoria || 'otros',
              cantidadVendida: 0,
              ingresos: 0
            }
          }
          productSales[productId].cantidadVendida += item.cantidad
          productSales[productId].ingresos += item.subtotal
        })

        // Ventas por mes
        const fecha = new Date(invoice.fechaEmision)
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const mesNombre = fecha.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })

        if (!monthlySales[mesKey]) {
          monthlySales[mesKey] = {
            mes: mesNombre,
            total: 0
          }
        }
        monthlySales[mesKey].total += invoice.total
      }
    })

    stats.value.productsSold = totalProductsSold
    stats.value.uniqueProducts = uniqueProductIds.size

    // Top 5 productos
    topProducts.value = Object.values(productSales)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5)

    // Últimos 6 meses de ventas
    salesChartData.value = Object.entries(monthlySales)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, data]) => data)

  } catch (error) {
    console.error('Error al cargar facturas:', error)
  }
}

const loadCustomers = async () => {
  try {
    const response = await api.get('/customers?activo=true')
    stats.value.totalCustomers = response.data?.length || 0
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

const applyFilters = () => {
  console.log('Aplicando filtros:', {
    period: selectedPeriod.value,
    dateRange: dateRange.value
  })
}

onMounted(async () => {
  await loadStats()
  await loadRecentInvoices()
  await loadCustomers()
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
