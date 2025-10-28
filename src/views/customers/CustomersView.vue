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

        <select v-model="filters.tipoDocumento" class="input">
          <option value="">Todos los documentos</option>
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
          <option value="CE">Carnet de Extranjería</option>
          <option value="PASAPORTE">Pasaporte</option>
        </select>

        <select v-model="filters.activo" class="input">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
    </AppCard>

    <!-- Customers Table -->
    <AppCard title="Lista de Clientes">
      <AppTable
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
              <p class="text-sm text-gray-500">{{ item.email }}</p>
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
import { useCustomersStore } from '@/stores/customers'
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
const customersStore = useCustomersStore()

const showModal = ref(false)
const editingCustomer = ref(null)
const filters = ref({
  search: '',
  tipoDocumento: '',
  activo: ''
})

const stats = ref({
  total: 89,
  activos: 82,
  nuevosMes: 8
})

const columns = [
  { key: 'nombre', label: 'Cliente' },
  { key: 'documento', label: 'Documento' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'direccion', label: 'Ciudad' },
  { key: 'activo', label: 'Estado' }
]

// Datos de ejemplo
const customers = ref([
  {
    _id: '1',
    nombre: 'Juan Pérez García',
    email: 'juan@email.com',
    tipoDocumento: 'DNI',
    numeroDocumento: '12345678',
    telefono: '987654321',
    direccion: { ciudad: 'Lima', codigoPostal: '15001' },
    activo: true
  },
  {
    _id: '2',
    nombre: 'María García López',
    email: 'maria@email.com',
    tipoDocumento: 'DNI',
    numeroDocumento: '87654321',
    telefono: '912345678',
    direccion: { ciudad: 'Arequipa', codigoPostal: '04001' },
    activo: true
  },
  {
    _id: '3',
    nombre: 'Empresa SAC',
    email: 'contacto@empresa.com',
    tipoDocumento: 'RUC',
    numeroDocumento: '20123456789',
    telefono: '014567890',
    direccion: { ciudad: 'Lima', codigoPostal: '15002' },
    activo: true
  }
])

const filteredCustomers = computed(() => {
  let result = customers.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(c =>
      c.nombre.toLowerCase().includes(search) ||
      c.numeroDocumento.includes(search) ||
      c.email?.toLowerCase().includes(search)
    )
  }

  if (filters.value.tipoDocumento) {
    result = result.filter(c => c.tipoDocumento === filters.value.tipoDocumento)
  }

  if (filters.value.activo) {
    const activo = filters.value.activo === 'true'
    result = result.filter(c => c.activo === activo)
  }

  return result
})

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const editCustomer = (customer) => {
  editingCustomer.value = { ...customer }
  showModal.value = true
}

const confirmDelete = async (customer) => {
  if (confirm(`¿Está seguro de eliminar el cliente ${customer.nombre}?`)) {
    try {
      await customersStore.deleteCustomer(customer._id)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}

const handleSubmit = async (customerData) => {
  try {
    if (editingCustomer.value) {
      await customersStore.updateCustomer(editingCustomer.value._id, customerData)
    } else {
      await customersStore.createCustomer(customerData)
    }
    closeModal()
  } catch (error) {
    console.error('Error:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingCustomer.value = null
}

onMounted(() => {
  // customersStore.fetchCustomers()
})
</script>
