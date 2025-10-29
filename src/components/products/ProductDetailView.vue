<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <p class="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
      </div>
      <AppButton variant="primary" :icon-left="PlusIcon" @click="showModal = true">
        Nuevo Producto
      </AppButton>
    </div>

    <!-- Filters -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppInput
          v-model="filters.search"
          placeholder="Buscar productos..."
          :icon-left="MagnifyingGlassIcon"
        />

        <select v-model="filters.categoria" class="input">
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
          <option value="alimentos">Alimentos</option>
          <option value="hogar">Hogar</option>
          <option value="otros">Otros</option>
        </select>

        <select v-model="filters.estado" class="input">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        <AppButton variant="secondary" :icon-left="FunnelIcon" @click="applyFilters">
          Filtrar
        </AppButton>
      </div>
    </AppCard>

    <!-- Products Table -->
    <AppCard title="Lista de Productos">
      <AppTable
        :columns="columns"
        :data="filteredProducts"
        empty-message="No hay productos disponibles"
      >
        <template #cell-codigo="{ value }">
          <span class="font-mono text-sm font-medium text-gray-900">{{ value }}</span>
        </template>

        <template #cell-nombre="{ item }">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <CubeIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ item.nombre }}</p>
              <p class="text-sm text-gray-500">{{ item.categoria }}</p>
            </div>
          </div>
        </template>

        <template #cell-precio="{ value }">
          <span class="font-semibold text-gray-900">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-stock="{ item }">
          <div class="flex items-center gap-2">
            <span :class="getStockClass(item)">{{ item.stock }}</span>
            <AppBadge v-if="item.stock <= item.stockMinimo" variant="warning" size="sm">
              Bajo
            </AppBadge>
          </div>
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
              @click="editProduct(item)"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              @click="confirmDelete(item)"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <!-- Modal de Nuevo/Editar Producto -->
    <AppModal
      v-model:show="showModal"
      :title="editingProduct ? 'Editar Producto' : 'Nuevo Producto'"
      subtitle="Complete los datos del producto"
      size="lg"
    >
      <ProductForm
        :product="editingProduct"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
//import { useProductsStore } from '@/stores/products'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppTable from '@/components/common/AppTable.vue'
import AppBadge from '@/components/common/AppBadge.vue'
import AppModal from '@/components/common/AppModal.vue'
import ProductForm from '@/components/products/ProductForm.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

//const productsStore = useProductsStore()

const showModal = ref(false)
const editingProduct = ref(null)
const filters = ref({
  search: '',
  categoria: '',
  estado: ''
})

const columns = [
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Producto' },
  { key: 'precio', label: 'Precio' },
  { key: 'stock', label: 'Stock' },
  { key: 'activo', label: 'Estado' }
]

// Datos de ejemplo
const products = ref([
  {
    _id: '1',
    codigo: 'PROD-001',
    nombre: 'Laptop Dell XPS 15',
    categoria: 'Electrónica',
    precio: 1500.00,
    stock: 25,
    stockMinimo: 10,
    activo: true
  },
  {
    _id: '2',
    codigo: 'PROD-002',
    nombre: 'Mouse Logitech MX Master',
    categoria: 'Electrónica',
    precio: 100.00,
    stock: 5,
    stockMinimo: 20,
    activo: true
  },
  {
    _id: '3',
    codigo: 'PROD-003',
    nombre: 'Teclado Mecánico RGB',
    categoria: 'Electrónica',
    precio: 150.00,
    stock: 45,
    stockMinimo: 15,
    activo: true
  }
])

const filteredProducts = computed(() => {
  let result = products.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(p =>
      p.nombre.toLowerCase().includes(search) ||
      p.codigo.toLowerCase().includes(search)
    )
  }

  if (filters.value.categoria) {
    result = result.filter(p => p.categoria.toLowerCase() === filters.value.categoria)
  }

  if (filters.value.estado) {
    const activo = filters.value.estado === 'true'
    result = result.filter(p => p.activo === activo)
  }

  return result
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const getStockClass = (item) => {
  if (item.stock <= item.stockMinimo) {
    return 'font-semibold text-red-600'
  }
  return 'font-semibold text-gray-900'
}

const editProduct = (product) => {
  editingProduct.value = { ...product }
  showModal.value = true
}

const confirmDelete = (product) => {
  if (confirm(`¿Está seguro de eliminar el producto ${product.nombre}?`)) {
    // Implementar eliminación
    console.log('Eliminando producto:', product)
  }
}

const handleSubmit = async (productData) => {
  try {
    if (editingProduct.value) {
      // Actualizar producto
      console.log('Actualizando:', productData)
    } else {
      // Crear nuevo producto
      console.log('Creando:', productData)
    }
    closeModal()
  } catch (error) {
    console.error('Error:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const applyFilters = () => {
  // Los filtros ya se aplican reactivamente
  console.log('Aplicando filtros:', filters.value)
}

onMounted(() => {
  // Cargar productos
})
</script>
