<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
        <p class="text-gray-600 mt-1">Gestiona tu cartera de clientes</p>
      </div>
      <AppButton variant="primary" :icon-left="PlusIcon" @click="showModal = true">
        Nuevo Cliente
      </AppButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Clientes</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total }}</p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UsersIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes Activos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.activos }}</p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Nuevos Este Mes</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.nuevosMes }}</p>
          </div>
          <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserPlusIcon class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Filters -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppInput
          v-model="filters.search"
          placeholder="Buscar por nombre, documento o email..."
          :icon-left="MagnifyingGlassIcon"
        />

        <select
          v-model="filters.tipoDocumento"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="">Todos los documentos</option>
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
          <option value="CE">Carnet de Extranjería</option>
          <option value="PASAPORTE">Pasaporte</option>
        </select>

        <select
          v-model="filters.activo"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
    </AppCard>

    <!-- Customers Table -->
    <AppCard title="Lista de Clientes">
      <div v-if="filteredCustomers.length === 0" class="text-center py-12">
        <UsersIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No hay clientes registrados</p>
      </div>
      <AppTable
        v-else
        :columns="columns"
        :data="filteredCustomers"
        empty-message="No hay clientes registrados"
      >
        <template #cell-nombre="{ item }">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {{ getInitials(item.nombre) }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ item.nombre }}</p>
              <p class="text-sm text-gray-500">{{ item.email || 'Sin email' }}</p>
            </div>
          </div>
        </template>

        <template #cell-documento="{ item }">
          <div>
            <p class="font-medium text-gray-900">{{ item.numeroDocumento }}</p>
            <p class="text-sm text-gray-500">{{ item.tipoDocumento }}</p>
          </div>
        </template>

        <template #cell-telefono="{ value }">
          <span class="text-sm text-gray-700">{{ value || '-' }}</span>
        </template>

        <template #cell-direccion="{ item }">
          <span class="text-sm text-gray-700">
            {{ item.direccion?.ciudad || '-' }}
          </span>
        </template>

        <template #cell-activo="{ value }">
          <AppBadge :variant="value ? 'success' : 'gray'">
            {{ value ? 'Activo' : 'Inactivo' }}
          </AppBadge>
        </template>

        <template #actions="{ item }">
          <div class="flex items-center gap-2">
            <button
              class="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              @click="editCustomer(item)"
              title="Editar"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              @click="router.push(`/clientes/${item._id}`)"
              title="Ver detalles"
            >
              <EyeIcon class="h-5 w-5" />
            </button>
            <button
              class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              @click="confirmDelete(item)"
              title="Eliminar"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <!-- Modal -->
    <AppModal
      v-model:show="showModal"
      :title="editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'"
      subtitle="Complete los datos del cliente"
      size="lg"
    >
      <CustomerForm
        :customer="editingCustomer"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppModal from '@/components/common/AppModal.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'

import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  CheckCircleIcon,
  UserPlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

const showModal = ref(false)
const editingCustomer = ref(null)
const loading = ref(false)
const filters = ref({
  search: '',
  tipoDocumento: '',
  activo: ''
})

const stats = computed(() => ({
  total: customers.value.length,
  activos: customers.value.filter(c => c.activo).length,
  nuevosMes: 8
}))

const columns = [
  { key: 'nombre', label: 'Cliente' },
  { key: 'documento', label: 'Documento' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'direccion', label: 'Ciudad' },
  { key: 'activo', label: 'Estado' }
]

const customers = ref([])

const filteredCustomers = computed(() => {
  let result = [...customers.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(c => {
      const matchesName = c.nombre?.toLowerCase().includes(search)
      const matchesDoc = c.numeroDocumento?.includes(search)
      const matchesEmail = c.email?.toLowerCase().includes(search)
      return matchesName || matchesDoc || matchesEmail
    })
  }

  if (filters.value.tipoDocumento) {
    result = result.filter(c => c.tipoDocumento === filters.value.tipoDocumento)
  }

  if (filters.value.activo !== '') {
    const activo = filters.value.activo === 'true'
    result = result.filter(c => c.activo === activo)
  }

  return result
})

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const loadCustomers = async () => {
  try {
    loading.value = true
    const response = await api.get('/customers')
    customers.value = response.data || []
    console.log('Clientes cargados:', customers.value.length)
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    customers.value = []
  } finally {
    loading.value = false
  }
}

const editCustomer = (customer) => {
  editingCustomer.value = { ...customer }
  showModal.value = true
}

const confirmDelete = async (customer) => {
  if (!customer || !customer._id) return

  if (confirm(`¿Está seguro de eliminar el cliente ${customer.nombre}?`)) {
    try {
      await api.delete(`/customers/${customer._id}`)
      customers.value = customers.value.filter(c => c._id !== customer._id)
      alert('Cliente eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el cliente')
    }
  }
}

const handleSubmit = async (customerData) => {
  try {
    loading.value = true

    if (editingCustomer.value) {
      // Actualizar cliente
      const response = await api.put(`/customers/${editingCustomer.value._id}`, customerData)
      const index = customers.value.findIndex(c => c._id === editingCustomer.value._id)
      if (index !== -1) {
        customers.value[index] = response.data
      }
      alert('Cliente actualizado correctamente')
    } else {
      // Crear nuevo cliente
      const response = await api.post('/customers', customerData)
      customers.value.unshift(response.data)
      alert('Cliente creado correctamente')
    }

    closeModal()
    await loadCustomers()
  } catch (error) {
    console.error('Error:', error)
    alert(error.mensaje || 'Error al guardar el cliente')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingCustomer.value = null
}

onMounted(() => {
  loadCustomers()
  console.log('CustomersView montado correctamente')
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
