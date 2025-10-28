<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">Bienvenido de vuelta, {{ userName }}</p>
      </div>
      <div class="flex items-center gap-3">
        <AppButton variant="outline" :icon-left="ArrowPathIcon" @click="refreshData">
          Actualizar
        </AppButton>
        <AppButton variant="primary" :icon-left="DocumentPlusIcon" @click="router.push('/facturas/crear')">
          Nueva Factura
        </AppButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Ventas del Mes"
        :value="formatCurrency(stats.monthlySales)"
        :trend="12.5"
        trend-label="+12.5% vs mes anterior"
        :icon="CurrencyDollarIcon"
        color="green"
      />
      <StatCard
        title="Facturas Pendientes"
        :value="stats.pendingInvoices"
        :trend="-5.2"
        trend-label="-5.2% vs mes anterior"
        :icon="DocumentTextIcon"
        color="yellow"
      />
      <StatCard
        title="Productos en Stock"
        :value="stats.totalProducts"
        :trend="8.1"
        trend-label="+8.1% vs mes anterior"
        :icon="CubeIcon"
        color="blue"
      />
      <StatCard
        title="Clientes Activos"
        :value="stats.activeCustomers"
        :trend="15.3"
        trend-label="+15.3% vs mes anterior"
        :icon="UsersIcon"
        color="purple"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Ventas Mensuales -->
      <AppCard title="Ventas Mensuales">
        <div class="h-80 flex items-center justify-center text-gray-400">
          <ChartBarIcon class="h-16 w-16 mb-2" />
        </div>
      </AppCard>

      <!-- Productos Más Vendidos -->
      <AppCard title="Productos Más Vendidos">
        <div class="space-y-3">
          <div
            v-for="product in topProducts"
            :key="product.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <CubeIcon class="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-sm text-gray-500">{{ product.sales }} ventas</p>
              </div>
            </div>
            <span class="font-semibold text-gray-900">{{ formatCurrency(product.revenue) }}</span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Recent Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Facturas Recientes -->
      <div class="lg:col-span-2">
        <AppCard title="Facturas Recientes">
          <template #actions>
            <a href="/facturas" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todas
            </a>
          </template>

          <AppTable
            :columns="invoiceColumns"
            :data="recentInvoices"
            :empty-message="'No hay facturas recientes'"
          >
            <template #cell-numeroFactura="{ value }">
              <span class="font-mono font-medium text-gray-900">{{ value }}</span>
            </template>

            <template #cell-cliente="{ item }">
              <div>
                <p class="font-medium text-gray-900">{{ item.cliente.nombre }}</p>
                <p class="text-sm text-gray-500">{{ item.cliente.email }}</p>
              </div>
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
              <button
                class="text-primary-600 hover:text-primary-700 font-medium text-sm"
                @click="router.push(`/facturas/${item._id}`)"
              >
                Ver detalles
              </button>
            </template>
          </AppTable>
        </AppCard>
      </div>

      <!-- Alertas de Stock -->
      <div>
        <AppCard title="Alertas de Stock">
          <template #actions>
            <AppBadge variant="danger">{{ lowStockProducts.length }}</AppBadge>
          </template>

          <div class="space-y-3">
            <div
              v-for="product in lowStockProducts"
              :key="product.id"
              class="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ product.nombre }}</p>
                  <p class="text-sm text-gray-600 mt-1">Stock: {{ product.stock }} unidades</p>
                </div>
                <ExclamationTriangleIcon class="h-5 w-5 text-red-500 flex-shrink-0" />
              </div>
              <div class="mt-2">
                <div class="w-full bg-red-200 rounded-full h-2">
                  <div
                    class="bg-red-500 h-2 rounded-full transition-all"
                    :style="{ width: `${(product.stock / product.stockMinimo) * 100}%` }"
                  />
                </div>
              </div>
            </div>

            <AppButton variant="outline" size="sm" full-width @click="router.push('/productos')">
              Ver todos los productos
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentPlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.nombre || 'Usuario')

// Datos de ejemplo (reemplazar con API real)
const stats = ref({
  monthlySales: 45280.50,
  pendingInvoices: 12,
  totalProducts: 156,
  activeCustomers: 89
})

const topProducts = ref([
  { id: 1, name: 'Laptop Dell XPS 15', sales: 45, revenue: 67500 },
  { id: 2, name: 'Mouse Logitech MX Master', sales: 32, revenue: 3200 },
  { id: 3, name: 'Teclado Mecánico RGB', sales: 28, revenue: 4200 },
  { id: 4, name: 'Monitor Samsung 27"', sales: 21, revenue: 12600 },
  { id: 5, name: 'Webcam Logitech C920', sales: 18, revenue: 2700 }
])

const invoiceColumns = [
  { key: 'numeroFactura', label: 'N° Factura' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'total', label: 'Total' },
  { key: 'estado', label: 'Estado' }
]

const recentInvoices = ref([
  {
    _id: '1',
    numeroFactura: 'FAC-000123',
    cliente: { nombre: 'Juan Pérez', email: 'juan@email.com' },
    total: 1250.00,
    estado: 'pagada'
  },
  {
    _id: '2',
    numeroFactura: 'FAC-000122',
    cliente: { nombre: 'María García', email: 'maria@email.com' },
    total: 890.50,
    estado: 'pendiente'
  },
  {
    _id: '3',
    numeroFactura: 'FAC-000121',
    cliente: { nombre: 'Carlos López', email: 'carlos@email.com' },
    total: 2100.00,
    estado: 'pagada'
  }
])

const lowStockProducts = ref([
  { id: 1, nombre: 'Mouse Inalámbrico', stock: 5, stockMinimo: 20 },
  { id: 2, nombre: 'Cable HDMI 2m', stock: 8, stockMinimo: 30 },
  { id: 3, nombre: 'Adaptador USB-C', stock: 3, stockMinimo: 15 }
])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
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

const refreshData = () => {
  // Implementar lógica de actualización
  console.log('Actualizando datos...')
}

onMounted(() => {
  // Cargar datos iniciales
})
</script>
