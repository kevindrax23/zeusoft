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

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Productos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ products.length }}</p>
          </div>
          <div class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CubeIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Stock Total</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalStock }}</p>
          </div>
          <div class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <ArchiveBoxIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Productos Activos</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ activeProducts }}</p>
          </div>
          <div class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>

      <AppCard padding="normal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Stock Bajo</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ lowStockCount }}</p>
          </div>
          <div class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Filters -->
    <AppCard padding="normal">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppInput
          v-model="filters.search"
          placeholder="Buscar productos..."
          :icon-left="MagnifyingGlassIcon"
        />

        <select
          v-model="filters.categoria"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
        >
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
          <option value="alimentos">Alimentos</option>
          <option value="hogar">Hogar</option>
          <option value="otros">Otros</option>
        </select>

        <select
          v-model="filters.estado"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
        >
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
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-500">Cargando productos...</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <CubeIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No hay productos disponibles</p>
      </div>
      <AppTable
        v-else
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
              <p class="text-sm text-gray-500 capitalize">{{ item.categoria }}</p>
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
              title="Editar"
            >
              <PencilIcon class="h-5 w-5" />
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
import api from '@/services/api'
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
  TrashIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const showModal = ref(false)
const editingProduct = ref(null)
const loading = ref(false)
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

const products = ref([])

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(p => {
      const matchesName = p.nombre?.toLowerCase().includes(search)
      const matchesCode = p.codigo?.toLowerCase().includes(search)
      return matchesName || matchesCode
    })
  }

  if (filters.value.categoria) {
    result = result.filter(p => p.categoria === filters.value.categoria)
  }

  if (filters.value.estado !== '') {
    const activo = filters.value.estado === 'true'
    result = result.filter(p => p.activo === activo)
  }

  return result
})

const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.stock || 0), 0)
})

const activeProducts = computed(() => {
  return products.value.filter(p => p.activo).length
})

const lowStockCount = computed(() => {
  return products.value.filter(p => p.stock <= p.stockMinimo).length
})

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'S/. 0.00'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const getStockClass = (item) => {
  if (!item) return 'font-semibold text-gray-900'
  if (item.stock <= item.stockMinimo) {
    return 'font-semibold text-red-600'
  }
  return 'font-semibold text-gray-900'
}

const loadProducts = async () => {
  try {
    loading.value = true
    const response = await api.get('/products')
    products.value = response.data || []
    console.log('Productos cargados:', products.value.length)
  } catch (error) {
    console.error('Error al cargar productos:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const editProduct = (product) => {
  if (!product) return
  editingProduct.value = { ...product }
  showModal.value = true
}

const confirmDelete = async (product) => {
  if (!product || !product._id) return

  if (confirm(`¿Está seguro de eliminar el producto ${product.nombre}?`)) {
    try {
      await api.delete(`/products/${product._id}`)
      products.value = products.value.filter(p => p._id !== product._id)
      alert('Producto eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el producto')
    }
  }
}

const handleSubmit = async (productData) => {
  try {
    loading.value = true

    if (editingProduct.value && editingProduct.value._id) {
      // Actualizar producto
      const response = await api.put(`/products/${editingProduct.value._id}`, productData)
      const index = products.value.findIndex(p => p._id === editingProduct.value._id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      alert('Producto actualizado correctamente')
    } else {
      // Crear nuevo producto
      const response = await api.post('/products', productData)
      products.value.unshift(response.data)
      alert('Producto creado correctamente')
    }

    closeModal()
    await loadProducts()
  } catch (error) {
    console.error('Error:', error)
    alert(error.mensaje || 'Error al guardar el producto')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const applyFilters = () => {
  console.log('Aplicando filtros:', filters.value)
}

onMounted(() => {
  loadProducts()
  console.log('ProductsView montado correctamente')
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
