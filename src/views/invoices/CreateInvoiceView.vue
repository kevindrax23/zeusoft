<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nueva Factura</h1>
        <p class="text-gray-600 mt-1">Complete los datos de la factura</p>
      </div>
      <AppButton variant="secondary" @click="router.push('/facturas')">
        Cancelar
      </AppButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulario Principal -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Selección de Cliente -->
        <AppCard title="Información del Cliente">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Cliente *
              </label>
              <select
                v-model="selectedCustomerId"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
                required
              >
                <option value="">Seleccione un cliente</option>
                <option
                  v-for="customer in customers"
                  :key="customer._id"
                  :value="customer._id"
                >
                  {{ customer.nombre }} - {{ customer.numeroDocumento }}
                </option>
              </select>
            </div>

            <div v-if="selectedCustomer" class="p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600">Tipo Documento:</p>
                  <p class="font-medium">{{ selectedCustomer.tipoDocumento }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Número:</p>
                  <p class="font-medium">{{ selectedCustomer.numeroDocumento }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Email:</p>
                  <p class="font-medium">{{ selectedCustomer.email || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Teléfono:</p>
                  <p class="font-medium">{{ selectedCustomer.telefono || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Productos -->
        <AppCard title="Productos">
          <div class="space-y-4">
            <!-- Botón Agregar Producto -->
            <AppButton
              variant="secondary"
              :icon-left="PlusIcon"
              @click="showProductSelector = true"
              class="w-full"
            >
              Agregar Producto
            </AppButton>

            <!-- Lista de Productos Seleccionados -->
            <div v-if="invoiceItems.length === 0" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <CubeIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500">No hay productos agregados</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(item, index) in invoiceItems"
                :key="index"
                class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CubeIcon class="h-6 w-6 text-gray-400" />
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ item.nombre }}</p>
                      <p class="text-sm text-gray-500">{{ item.codigo }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeItem(index)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>

                <div class="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Cantidad</label>
                    <input
                      v-model.number="item.cantidad"
                      type="number"
                      min="1"
                      :max="item.stockDisponible"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      @input="updateItemSubtotal(index)"
                    />
                    <p class="text-xs text-gray-500 mt-1">Stock: {{ item.stockDisponible }}</p>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Precio Unit.</label>
                    <input
                      v-model.number="item.precioUnitario"
                      type="number"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      @input="updateItemSubtotal(index)"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">Subtotal</label>
                    <input
                      :value="formatCurrency(item.subtotal)"
                      type="text"
                      readonly
                      class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Notas -->
        <AppCard title="Notas (Opcional)">
          <textarea
            v-model="notas"
            rows="3"
            placeholder="Agregue notas adicionales para esta factura..."
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
        </AppCard>
      </div>

      <!-- Resumen -->
      <div class="lg:col-span-1">
        <AppCard title="Resumen" class="sticky top-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">IGV (18%):</span>
                <span class="font-medium">{{ formatCurrency(igv) }}</span>
              </div>
              <div class="pt-2 border-t border-gray-200">
                <div class="flex justify-between">
                  <span class="font-semibold text-gray-900">Total:</span>
                  <span class="text-2xl font-bold text-primary-600">
                    {{ formatCurrency(total) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Productos:</span>
                <span class="font-medium">{{ invoiceItems.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Cantidad Total:</span>
                <span class="font-medium">{{ totalQuantity }}</span>
              </div>
            </div>

            <AppButton
              variant="primary"
              class="w-full"
              :disabled="!canCreateInvoice || loading"
              :loading="loading"
              @click="createInvoice"
            >
              Generar Factura
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- Modal Selector de Productos -->
    <AppModal
      v-model:show="showProductSelector"
      title="Seleccionar Producto"
      subtitle="Elija un producto para agregar a la factura"
      size="lg"
    >
      <ProductSelector @select="addProduct" />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import ProductSelector from '@/components/common/ProductSelector.vue'
import { PlusIcon, CubeIcon, TrashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const customers = ref([])
const selectedCustomerId = ref('')
const invoiceItems = ref([])
const notas = ref('')
const showProductSelector = ref(false)
const loading = ref(false)

const selectedCustomer = computed(() => {
  return customers.value.find(c => c._id === selectedCustomerId.value)
})

const subtotal = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const igv = computed(() => {
  return subtotal.value * 0.18
})

const total = computed(() => {
  return subtotal.value + igv.value
})

const totalQuantity = computed(() => {
  return invoiceItems.value.reduce((sum, item) => sum + item.cantidad, 0)
})

const canCreateInvoice = computed(() => {
  return selectedCustomerId.value && invoiceItems.value.length > 0
})

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'S/. 0.00'
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const loadCustomers = async () => {
  try {
    const response = await api.get('/customers?activo=true')
    customers.value = response.data || []
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

const addProduct = (product) => {
  // Verificar si el producto ya está en la lista
  const existingItem = invoiceItems.value.find(item => item.producto === product._id)

  if (existingItem) {
    if (existingItem.cantidad < product.stock) {
      existingItem.cantidad++
      updateItemSubtotal(invoiceItems.value.indexOf(existingItem))
    } else {
      alert('No hay más stock disponible para este producto')
    }
  } else {
    invoiceItems.value.push({
      producto: product._id,
      codigo: product.codigo,
      nombre: product.nombre,
      cantidad: 1,
      precioUnitario: product.precio,
      subtotal: product.precio,
      stockDisponible: product.stock
    })
  }

  showProductSelector.value = false
}

const removeItem = (index) => {
  invoiceItems.value.splice(index, 1)
}

const updateItemSubtotal = (index) => {
  const item = invoiceItems.value[index]
  item.subtotal = item.cantidad * item.precioUnitario
}

const createInvoice = async () => {
  if (!canCreateInvoice.value) {
    alert('Por favor complete todos los campos requeridos')
    return
  }

  try {
    loading.value = true

    const invoiceData = {
      cliente: selectedCustomerId.value,
      items: invoiceItems.value.map(item => ({
        producto: item.producto,
        cantidad: item.cantidad
      })),
      notas: notas.value
    }

    await api.post('/invoices', invoiceData)

    alert('Factura creada exitosamente')
    router.push('/facturas')
  } catch (error) {
    console.error('Error al crear factura:', error)
    alert(error.mensaje || 'Error al crear la factura')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomers()
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
