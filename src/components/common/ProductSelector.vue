<template>
  <div class="space-y-4">
    <!-- Buscador -->
    <AppInput
      v-model="searchQuery"
      placeholder="Buscar producto por nombre o código..."
      :icon-left="MagnifyingGlassIcon"
    />

    <!-- Lista de Productos -->
    <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Cargando productos...</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="text-center py-8">
        <CubeIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">No hay productos disponibles</p>
      </div>
      <div v-else class="divide-y divide-gray-200">
        <button
          v-for="product in filteredProducts"
          :key="product._id"
          @click="selectProduct(product)"
          class="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center justify-between group"
        >
          <div class="flex items-center gap-3 flex-1">
            <div class="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <CubeIcon class="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ product.nombre }}</p>
              <p class="text-sm text-gray-500">
                {{ product.codigo }} • {{ product.categoria }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-semibold text-gray-900">{{ formatCurrency(product.precio) }}</p>
            <p class="text-sm text-gray-500">
              Stock: <span :class="getStockClass(product)">{{ product.stock }}</span>
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import AppInput from './AppInput.vue'
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['select'])

const products = ref([])
const searchQuery = ref('')
const loading = ref(false)

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value

  const search = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    p.nombre.toLowerCase().includes(search) ||
    p.codigo.toLowerCase().includes(search)
  )
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const getStockClass = (product) => {
  if (product.stock <= product.stockMinimo) return 'text-red-600 font-semibold'
  return 'text-gray-700'
}

const selectProduct = (product) => {
  if (product.stock <= 0) {
    alert('Producto sin stock disponible')
    return
  }
  emit('select', product)
}

const loadProducts = async () => {
  try {
    loading.value = true
    const response = await api.get('/products?activo=true')
    products.value = response.data || []
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>
