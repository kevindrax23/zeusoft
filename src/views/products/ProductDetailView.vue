<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          @click="router.push('/productos')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon class="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Detalle del Producto</h1>
          <p class="text-gray-600 mt-1">Información completa del producto</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <AppButton variant="secondary" :icon-left="PencilIcon" @click="editProduct">
          Editar
        </AppButton>
        <AppButton variant="danger" :icon-left="TrashIcon" @click="deleteProduct">
          Eliminar
        </AppButton>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Cargando información del producto...</p>
    </div>

    <div v-else-if="!product" class="text-center py-12">
      <CubeIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Producto no encontrado</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Información Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Datos Generales -->
        <AppCard title="Información General">
          <div class="space-y-6">
            <!-- Código y Nombre -->
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Código</label>
                <div class="px-4 py-3 bg-gray-50 rounded-lg">
                  <p class="font-mono font-semibold text-gray-900">{{ product.codigo }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <div class="px-4 py-3 bg-gray-50 rounded-lg">
                  <AppBadge :variant="product.activo ? 'success' : 'gray'">
                    {{ product.activo ? 'Activo' : 'Inactivo' }}
                  </AppBadge>
                </div>
              </div>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
              <div class="px-4 py-3 bg-gray-50 rounded-lg">
                <p class="font-medium text-gray-900">{{ product.nombre }}</p>
              </div>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <div class="px-4 py-3 bg-gray-50 rounded-lg min-h-[80px]">
                <p class="text-gray-700">{{ product.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <div class="px-4 py-3 bg-gray-50 rounded-lg">
                <span class="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-700 capitalize">
                  {{ product.categoria }}
                </span>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Precios y Costos -->
        <AppCard title="Precios y Costos">
          <div class="grid grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio de Venta</label>
              <div class="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-2xl font-bold text-green-700">{{ formatCurrency(product.precio) }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Costo</label>
              <div class="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p class="text-2xl font-bold text-orange-700">{{ formatCurrency(product.costo) }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Margen de Ganancia</label>
              <div class="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-2xl font-bold text-blue-700">{{ margenGanancia }}%</p>
              </div>
            </div>
          </div>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Ganancia por Unidad:</span>
              <span class="text-lg font-bold text-gray-900">{{ formatCurrency(gananciaUnitaria) }}</span>
            </div>
          </div>
        </AppCard>

        <!-- Inventario -->
        <AppCard title="Control de Inventario">
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
                <div class="px-4 py-3 rounded-lg" :class="stockClasses">
                  <p class="text-3xl font-bold">{{ product.stock }}</p>
                  <p class="text-sm mt-1">unidades disponibles</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                <div class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p class="text-3xl font-bold text-gray-700">{{ product.stockMinimo }}</p>
                  <p class="text-sm text-gray-600 mt-1">alerta de reabastecimiento</p>
                </div>
              </div>
            </div>

            <!-- Alertas -->
            <div v-if="product.stock <= product.stockMinimo" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-red-900">Stock Bajo</p>
                <p class="text-sm text-red-700 mt-1">
                  El stock actual está por debajo del mínimo recomendado. Considere reabastecer este producto.
                </p>
              </div>
            </div>

            <div v-else-if="product.stock <= product.stockMinimo * 1.5" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-yellow-900">Stock Moderado</p>
                <p class="text-sm text-yellow-700 mt-1">
                  El stock está cerca del límite mínimo. Planifique el reabastecimiento pronto.
                </p>
              </div>
            </div>

            <div v-else class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircleIcon class="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-green-900">Stock Óptimo</p>
                <p class="text-sm text-green-700 mt-1">
                  El stock actual está en niveles óptimos.
                </p>
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
                <span class="text-sm text-blue-700">Valor en Inventario</span>
                <CubeIcon class="h-5 w-5 text-blue-600" />
              </div>
              <p class="text-2xl font-bold text-blue-900">{{ formatCurrency(valorInventario) }}</p>
            </div>

            <div class="p-4 bg-purple-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-purple-700">Valor de Venta</span>
                <CurrencyDollarIcon class="h-5 w-5 text-purple-600" />
              </div>
              <p class="text-2xl font-bold text-purple-900">{{ formatCurrency(valorVenta) }}</p>
            </div>

            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-green-700">Ganancia Potencial</span>
                <ChartBarIcon class="h-5 w-5 text-green-600" />
              </div>
              <p class="text-2xl font-bold text-green-900">{{ formatCurrency(gananciaPotencial) }}</p>
            </div>
          </div>
        </AppCard>

        <!-- Información Adicional -->
        <AppCard title="Información Adicional">
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Fecha de Creación:</span>
              <span class="font-medium text-gray-900">{{ formatDate(product.createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200">
              <span class="text-gray-600">Última Actualización:</span>
              <span class="font-medium text-gray-900">{{ formatDate(product.updatedAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600">ID del Producto:</span>
              <span class="font-mono text-xs text-gray-700">{{ product._id }}</span>
            </div>
          </div>
        </AppCard>

        <!-- Acciones Rápidas -->
        <AppCard title="Acciones Rápidas">
          <div class="space-y-3">
            <AppButton variant="primary" class="w-full" @click="adjustStock">
              Ajustar Stock
            </AppButton>
            <AppButton variant="secondary" class="w-full" @click="viewHistory">
              Ver Historial
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
      title="Editar Producto"
      subtitle="Actualice la información del producto"
      size="lg"
    >
      <ProductForm
        :product="product"
        @submit="handleUpdate"
        @cancel="showEditModal = false"
      />
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
import ProductForm from '@/components/products/ProductForm.vue'
import { formatCurrency, formatDate } from '@/config/settings'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const product = ref(null)
const loading = ref(false)
const showEditModal = ref(false)

const margenGanancia = computed(() => {
  if (!product.value) return 0
  const margen = ((product.value.precio - product.value.costo) / product.value.precio) * 100
  return margen.toFixed(2)
})

const gananciaUnitaria = computed(() => {
  if (!product.value) return 0
  return product.value.precio - product.value.costo
})

const valorInventario = computed(() => {
  if (!product.value) return 0
  return product.value.stock * product.value.costo
})

const valorVenta = computed(() => {
  if (!product.value) return 0
  return product.value.stock * product.value.precio
})

const gananciaPotencial = computed(() => {
  if (!product.value) return 0
  return valorVenta.value - valorInventario.value
})

const stockClasses = computed(() => {
  if (!product.value) return 'bg-gray-50 border border-gray-200'

  if (product.value.stock <= product.value.stockMinimo) {
    return 'bg-red-50 border border-red-200 text-red-700'
  } else if (product.value.stock <= product.value.stockMinimo * 1.5) {
    return 'bg-yellow-50 border border-yellow-200 text-yellow-700'
  }
  return 'bg-green-50 border border-green-200 text-green-700'
})



const loadProduct = async () => {
  try {
    loading.value = true
    const productId = route.params.id
    const response = await api.get(`/products/${productId}`)
    product.value = response.data
  } catch (error) {
    console.error('Error al cargar producto:', error)
    alert('Error al cargar el producto')
  } finally {
    loading.value = false
  }
}

const editProduct = () => {
  showEditModal.value = true
}

const handleUpdate = async (productData) => {
  try {
    await api.put(`/products/${product.value._id}`, productData)
    await loadProduct()
    showEditModal.value = false
    alert('Producto actualizado correctamente')
  } catch (error) {
    console.error('Error:', error)
    alert('Error al actualizar el producto')
  }
}

const deleteProduct = async () => {
  if (confirm(`¿Está seguro de eliminar el producto ${product.value.nombre}?`)) {
    try {
      await api.delete(`/products/${product.value._id}`)
      alert('Producto eliminado correctamente')
      router.push('/productos')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el producto')
    }
  }
}

const adjustStock = () => {
  const newStock = prompt(`Stock actual: ${product.value.stock}\n\nIngrese el nuevo stock:`, product.value.stock)
  if (newStock !== null && !isNaN(newStock)) {
    handleUpdate({ ...product.value, stock: parseInt(newStock) })
  }
}

const viewHistory = () => {
  alert('Función de historial en desarrollo')
}

const generateReport = () => {
  alert('Función de reporte en desarrollo')
}

onMounted(() => {
  loadProduct()
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
