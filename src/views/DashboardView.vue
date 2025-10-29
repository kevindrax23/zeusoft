<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          Bienvenido de nuevo, aquí está tu resumen
        </p>
      </div>
      <div class="flex items-center gap-3">
        <AppButton
          variant="secondary"
          :icon-left="ArrowPathIcon"
          @click="refreshData"
          :loading="loading"
        >
          Actualizar
        </AppButton>
        <AppButton variant="primary" :icon-left="PlusIcon" @click="router.push('/facturas/crear')">
          Nueva Compra
        </AppButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Ventas -->
      <AppCard padding="normal" hover>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Ventas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ formatCurrency(stats.totalSales) }}
            </p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center">
              <ArrowTrendingUpIcon class="h-3 w-3 mr-1" />
              {{ stats.paidInvoices }} facturas pagadas
            </p>
          </div>
          <div
            class="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
          >
            <CurrencyDollarIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </AppCard>

      <!-- Total Productos -->
      <AppCard padding="normal" hover>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.totalProducts }}
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center">
              <CubeIcon class="h-3 w-3 mr-1" />
              {{ stats.activeProducts }} activos
            </p>
          </div>
          <div
            class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
          >
            <CubeIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </AppCard>

      <!-- Total Clientes -->
      <AppCard padding="normal" hover>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.totalCustomers }}
            </p>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center">
              <UsersIcon class="h-3 w-3 mr-1" />
              {{ stats.activeCustomers }} activos
            </p>
          </div>
          <div
            class="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
          >
            <UsersIcon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </AppCard>

      <!-- Facturas Pendientes -->
      <AppCard padding="normal" hover>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Facturas Pendientes</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.pendingInvoices }}
            </p>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center">
              <ClockIcon class="h-3 w-3 mr-1" />
              Por cobrar
            </p>
          </div>
          <div
            class="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center"
          >
            <DocumentTextIcon class="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Charts and Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Ventas Mensuales Chart -->
      <div class="lg:col-span-2">
        <AppCard title="Ventas Mensuales" subtitle="Últimos 6 meses">
          <div class="h-80">
            <SalesLineChart v-if="monthlySalesData.length > 0" :data="monthlySalesData" />
            <div
              v-else
              class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="text-center">
                <ChartBarIcon class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                <p class="text-gray-500 dark:text-gray-400">No hay datos de ventas</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Actividad Reciente -->
      <div>
        <AppCard title="Actividad Reciente" subtitle="Últimas acciones">
          <div class="space-y-4">
            <div v-if="recentActivity.length === 0" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">No hay actividad reciente</p>
            </div>
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                class="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="activity.iconBg"
              >
                <component :is="activity.icon" class="h-5 w-5" :class="activity.iconColor" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ activity.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Productos con Stock Bajo y Últimas Facturas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Productos con Stock Bajo -->
      <AppCard title="Productos con Stock Bajo" subtitle="Requieren reabastecimiento">
        <div v-if="lowStockProducts.length === 0" class="text-center py-8">
          <CheckCircleIcon class="h-12 w-12 text-green-400 dark:text-green-600 mx-auto mb-2" />
          <p class="text-gray-500 dark:text-gray-400">
            Todos los productos tienen stock suficiente
          </p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="product in lowStockProducts"
            :key="product._id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="router.push(`/productos/${product._id}`)"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"
              >
                <ExclamationTriangleIcon class="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ product.nombre }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.codigo }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-red-600 dark:text-red-400">
                Stock: {{ product.stock }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Mín: {{ product.stockMinimo }}</p>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Últimas Facturas -->
      <AppCard title="Últimas Facturas" subtitle="Facturas recientes">
        <div v-if="recentInvoices.length === 0" class="text-center py-8">
          <DocumentTextIcon class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p class="text-gray-500 dark:text-gray-400">No hay facturas registradas</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="invoice in recentInvoices"
            :key="invoice._id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="router.push(`/facturas/${invoice._id}`)"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center"
              >
                <DocumentTextIcon class="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ invoice.numeroFactura }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ invoice.cliente?.nombre }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(invoice.total) }}
              </p>
              <AppBadge :variant="getStatusVariant(invoice.estado)" size="sm">
                {{ getStatusLabel(invoice.estado) }}
              </AppBadge>
            </div>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Quick Actions -->
    <AppCard title="Acciones Rápidas" subtitle="Accesos directos">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          @click="router.push('/facturas/crear')"
          class="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-lg hover:shadow-md transition-all group"
        >
          <DocumentTextIcon
            class="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform"
          />
          <p class="font-semibold text-gray-900 dark:text-white">Nueva Compra</p>
        </button>

        <button
          @click="router.push('/productos')"
          class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg hover:shadow-md transition-all group"
        >
          <CubeIcon
            class="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform"
          />
          <p class="font-semibold text-gray-900 dark:text-white">Gestionar Productos</p>
        </button>

        <button
          @click="router.push('/clientes')"
          class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg hover:shadow-md transition-all group"
        >
          <UsersIcon
            class="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform"
          />
          <p class="font-semibold text-gray-900 dark:text-white">Gestionar Clientes</p>
        </button>

        <button
          @click="router.push('/reportes')"
          class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg hover:shadow-md transition-all group"
        >
          <ChartBarIcon
            class="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform"
          />
          <p class="font-semibold text-gray-900 dark:text-white">Ver Reportes</p>
        </button>
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
import AppBadge from '@/components/common/AppBadge.vue'
import SalesLineChart from '@/components/charts/SalesLineChart.vue'
import {
  CurrencyDollarIcon,
  CubeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const loading = ref(false)

const stats = ref({
  totalSales: 0,
  paidInvoices: 0,
  totalProducts: 0,
  activeProducts: 0,
  totalCustomers: 0,
  activeCustomers: 0,
  pendingInvoices: 0,
})

const monthlySalesData = ref([])
const recentActivity = ref([])
const lowStockProducts = ref([])
const recentInvoices = ref([])

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

const loadDashboardData = async () => {
  loading.value = true
  try {
    // Cargar estadísticas de facturas
    const invoicesStatsRes = await api.get('/invoices/stats')
    const invoicesStats = invoicesStatsRes.data || {}

    stats.value.totalSales = invoicesStats.totalSales || 0
    stats.value.paidInvoices = invoicesStats.paidInvoices || 0
    stats.value.pendingInvoices = invoicesStats.pendingInvoices || 0

    // Cargar facturas para gráfica y actividad
    const invoicesRes = await api.get('/invoices')
    const invoices = invoicesRes.data || []

    // Últimas 5 facturas
    recentInvoices.value = invoices.slice(0, 5)

    // Calcular ventas mensuales
    const monthlySales = {}
    invoices.forEach((invoice) => {
      if (invoice.estado !== 'anulada') {
        const fecha = new Date(invoice.fechaEmision)
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        const mesNombre = fecha.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })

        if (!monthlySales[mesKey]) {
          monthlySales[mesKey] = {
            mes: mesNombre,
            total: 0,
          }
        }
        monthlySales[mesKey].total += invoice.total
      }
    })

    monthlySalesData.value = Object.entries(monthlySales)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, data]) => data)

    // Actividad reciente basada en facturas
    recentActivity.value = invoices.slice(0, 5).map((invoice) => ({
      id: invoice._id,
      icon: DocumentTextIcon,
      iconBg:
        invoice.estado === 'pagada'
          ? 'bg-green-100 dark:bg-green-900/30'
          : 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor:
        invoice.estado === 'pagada'
          ? 'text-green-600 dark:text-green-400'
          : 'text-yellow-600 dark:text-yellow-400',
      title: `Factura ${invoice.numeroFactura}`,
      description: `Cliente: ${invoice.cliente?.nombre || 'N/A'}`,
      time: formatDate(invoice.fechaEmision),
    }))

    // Cargar productos
    const productsRes = await api.get('/products')
    const products = productsRes.data || []

    stats.value.totalProducts = products.length
    stats.value.activeProducts = products.filter((p) => p.activo).length

    // Productos con stock bajo
    lowStockProducts.value = products.filter((p) => p.stock <= p.stockMinimo).slice(0, 5)

    // Cargar clientes
    const customersRes = await api.get('/customers')
    const customers = customersRes.data || []

    stats.value.totalCustomers = customers.length
    stats.value.activeCustomers = customers.filter((c) => c.activo).length
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadDashboardData()
}

onMounted(() => {
  loadDashboardData()
})
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
