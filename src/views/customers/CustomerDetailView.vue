<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/clientes')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon class="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Detalle del Cliente</h1>
          <p class="text-gray-600 mt-1">Información completa del cliente</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <AppButton variant="secondary" :icon-left="PencilIcon" @click="editCustomer">
          Editar
        </AppButton>
        <AppButton variant="danger" :icon-left="TrashIcon" @click="deleteCustomer">
          Eliminar
        </AppButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Cargando información del cliente...</p>
    </div>

    <div v-else-if="!customer" class="text-center py-12">
      <UsersIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Cliente no encontrado</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Datos Personales -->
        <AppCard title="Información Personal">
          <div class="flex items-start gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                class="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              >
                {{ getInitials(customer.nombre) }}
              </div>
            </div>

            <!-- Datos -->
            <div class="flex-1 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Nombre Completo / Razón Social</label
                  >
                  <p class="text-lg font-semibold text-gray-900">{{ customer.nombre }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <AppBadge :variant="customer.activo ? 'success' : 'gray'" size="lg">
                    {{ customer.activo ? 'Activo' : 'Inactivo' }}
                  </AppBadge>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Tipo de Documento</label
                  >
                  <p class="text-gray-900">{{ customer.tipoDocumento }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Número de Documento</label
                  >
                  <p class="font-mono text-gray-900">{{ customer.numeroDocumento }}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Información de Contacto -->
        <AppCard title="Información de Contacto">
          <div class="grid grid-cols-2 gap-6">
            <div class="flex items-start gap-3">
              <div
                class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <EnvelopeIcon class="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Correo Electrónico</label
                >
                <p class="text-gray-900">{{ customer.email || 'No registrado' }}</p>
                <a
                  v-if="customer.email"
                  :href="`mailto:${customer.email}`"
                  class="text-sm text-primary-600 hover:text-primary-700"
                >
                  Enviar correo
                </a>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div
                class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <PhoneIcon class="h-5 w-5 text-green-600" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <p class="text-gray-900">{{ customer.telefono || 'No registrado' }}</p>
                <a
                  v-if="customer.telefono"
                  :href="`tel:${customer.telefono}`"
                  class="text-sm text-primary-600 hover:text-primary-700"
                >
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Dirección -->
        <AppCard title="Dirección">
          <div class="flex items-start gap-3">
            <div
              class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <MapPinIcon class="h-5 w-5 text-purple-600" />
            </div>
            <div class="flex-1">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Calle / Avenida</label
                  >
                  <p class="text-gray-900">{{ customer.direccion?.calle || 'No registrado' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <p class="text-gray-900">{{ customer.direccion?.ciudad || 'No registrado' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <p class="text-gray-900">
                    {{ customer.direccion?.codigoPostal || 'No registrado' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <p class="text-gray-900">{{ customer.direccion?.pais || 'No registrado' }}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Historial de Compras -->
        <AppCard title="Historial de Compras">
          <div v-if="invoices.length === 0" class="text-center py-8">
            <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-500">No hay compras registradas</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="invoice in invoices"
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
                  <p class="text-sm text-gray-500">{{ formatDate(invoice.fechaEmision) }}</p>
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

      <!-- Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Estadísticas -->
        <AppCard title="Estadísticas">
          <div class="space-y-4">
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-blue-700">Total Comprado</span>
                <CurrencyDollarIcon class="h-5 w-5 text-blue-600" />
              </div>
              <p class="text-2xl font-bold text-blue-900">
                {{ formatCurrency(stats.totalComprado) }}
              </p>
            </div>

            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-green-700">Facturas Totales</span>
                <DocumentTextIcon class="h-5 w-5 text-green-600" />
              </div>
              <p class="text-2xl font-bold text-green-900">{{ stats.totalFacturas }}</p>
            </div>

            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-purple-700">Facturas Pagadas</span>
                <CheckCircleIcon class="h-5 w-5 text-purple-600" />
              </div>
              <p class="text-2xl font-bold text-purple-900">{{ stats.facturasPagadas }}</p>
            </div>

            <div class="p-4 bg-orange-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-orange-700">Última Compra</span>
                <ClockIcon class="h-5 w-5 text-orange-600" />
              </div>
              <p class="text-sm font-bold text-orange-900">
                {{ stats.ultimaCompra ? formatDate(stats.ultimaCompra) : 'N/A' }}
              </p>
            </div>
          </div>
        </AppCard>

        <!-- Información Adicional -->
        <AppCard title="Información Adicional">
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Fecha de Registro:</span>
              <span class="font-medium text-gray-900">{{ formatDate(customer.createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Última Actualización:</span>
              <span class="font-medium text-gray-900">{{ formatDate(customer.updatedAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600">ID del Cliente:</span>
              <span class="font-mono text-xs text-gray-700">{{ customer._id }}</span>
            </div>
          </div>
        </AppCard>

        <!-- Acciones Rápidas -->
        <AppCard title="Acciones Rápidas">
          <div class="space-y-3">
            <AppButton variant="primary" class="w-full" @click="router.push('/facturas/crear')">
              Nueva Factura
            </AppButton>
            <AppButton variant="secondary" class="w-full" @click="generateReport">
              Generar Reporte
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Modal de Edición -->
    <AppModal
      v-model:show="showEditModal"
      title="Editar Cliente"
      subtitle="Actualice la información del cliente"
      size="lg"
    >
      <CustomerForm :customer="customer" @submit="handleUpdate" @cancel="showEditModal = false" />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppModal from '@/components/common/AppModal.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import { formatCurrency, formatDate } from '@/config/settings'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const customer = ref(null)
const invoices = ref([])
const loading = ref(false)
const showEditModal = ref(false)

const stats = computed(() => {
  const totalComprado = invoices.value
    .filter((inv) => inv.estado !== 'anulada')
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalFacturas = invoices.value.length

  const facturasPagadas = invoices.value.filter((inv) => inv.estado === 'pagada').length

  const ultimaCompra = invoices.value.length > 0 ? invoices.value[0].fechaEmision : null

  return {
    totalComprado,
    totalFacturas,
    facturasPagadas,
    ultimaCompra,
  }
})

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

const loadCustomer = async () => {
  try {
    loading.value = true
    const customerId = route.params.id
    const response = await api.get(`/customers/${customerId}`)
    customer.value = response.data
  } catch (error) {
    console.error('Error al cargar cliente:', error)
    alert('Error al cargar el cliente')
  } finally {
    loading.value = false
  }
}

const loadInvoices = async () => {
  try {
    const customerId = route.params.id
    const response = await api.get('/invoices')
    // Filtrar facturas de este cliente
    invoices.value = (response.data || [])
      .filter((inv) => inv.cliente?._id === customerId || inv.cliente === customerId)
      .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision))
  } catch (error) {
    console.error('Error al cargar facturas:', error)
  }
}

const editCustomer = () => {
  showEditModal.value = true
}

const handleUpdate = async (customerData) => {
  try {
    await api.put(`/customers/${customer.value._id}`, customerData)
    await loadCustomer()
    showEditModal.value = false
    alert('Cliente actualizado correctamente')
  } catch (error) {
    console.error('Error:', error)
    alert('Error al actualizar el cliente')
  }
}

const deleteCustomer = async () => {
  if (confirm(`¿Está seguro de eliminar al cliente ${customer.value.nombre}?`)) {
    try {
      await api.delete(`/customers/${customer.value._id}`)
      alert('Cliente eliminado correctamente')
      router.push('/clientes')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el cliente')
    }
  }
}

const generateReport = () => {
  alert('Función de reporte en desarrollo')
}

onMounted(async () => {
  await loadCustomer()
  await loadInvoices()
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
