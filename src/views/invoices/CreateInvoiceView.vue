<template>
  <div class="space-y-6 animation-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nueva Factura</h1>
        <p class="text-gray-600 mt-1">Complete los datos de la factura</p>
      </div>
      <AppButton variant="secondary" :icon-left="ArrowLeftIcon" @click="router.push('/facturas')">
        Volver
      </AppButton>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Cliente y Datos Generales -->
      <AppCard title="Información del Cliente">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="label">Cliente *</label>
            <div class="flex gap-3">
              <select v-model="form.clienteId" class="input flex-1" required>
                <option value="">Seleccione un cliente</option>
                <option v-for="customer in customers" :key="customer._id" :value="customer._id">
                  {{ customer.nombre }} - {{ customer.numeroDocumento }}
                </option>
              </select>
              <AppButton type="button" variant="outline" @click="showCustomerModal = true">
                Nuevo Cliente
              </AppButton>
            </div>
          </div>

          <AppInput
            v-model="form.fechaEmision"
            type="date"
            label="Fecha de Emisión"
            required
          />

          <AppInput
            v-model="form.fechaVencimiento"
            type="date"
            label="Fecha de Vencimiento"
          />

          <div>
            <label class="label">Método de Pago *</label>
            <select v-model="form.metodoPago" class="input" required>
              <option value="">Seleccione método</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          <div>
            <label class="label">Estado</label>
            <select v-model="form.estado" class="input">
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
            </select>
          </div>
        </div>
      </AppCard>

      <!-- Items de la Factura -->
      <AppCard title="Items de la Factura">
        <div class="space-y-4">
          <div
            v-for="(item, index) in form.items"
            :key="index"
            class="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-5">
                <label class="label text-xs">Producto *</label>
                <select
                  v-model="item.productoId"
                  @change="updateItemFromProduct(index)"
                  class="input"
                  required
                >
                  <option value="">Seleccione producto</option>
                  <option v-for="product in products" :key="product._id" :value="product._id">
                    {{ product.nombre }} - {{ formatCurrency(product.precio) }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="label text-xs">Cantidad *</label>
                <input
                  v-model.number="item.cantidad"
                  type="number"
                  min="1"
                  class="input"
                  required
                  @input="calculateItemSubtotal(index)"
                />
              </div>

              <div class="md:col-span-2">
                <label class="label text-xs">Precio Unit.</label>
                <input
                  v-model.number="item.precioUnitario"
                  type="number"
                  step="0.01"
                  class="input"
                  required
                  @input="calculateItemSubtotal(index)"
                />
              </div>

              <div class="md:col-span-2">
                <label class="label text-xs">Subtotal</label>
                <input
                  :value="formatCurrency(item.subtotal)"
                  type="text"
                  class="input bg-gray-100"
                  disabled
                />
              </div>

              <div class="md:col-span-1 flex items-end">
                <button
                  type="button"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  @click="removeItem(index)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <AppButton
            type="button"
            variant="outline"
            :icon-left="PlusIcon"
            @click="addItem"
            full-width
          >
            Agregar Item
          </AppButton>
        </div>
      </AppCard>

      <!-- Totales y Notas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <AppCard title="Notas Adicionales">
            <AppInput
              v-model="form.notas"
              type="textarea"
              placeholder="Agregar notas o comentarios..."
              :rows="6"
            />
          </AppCard>
        </div>

        <div>
          <AppCard title="Resumen">
            <div class="space-y-3">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(totals.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-700">
                <span>IGV (18%):</span>
                <span class="font-medium">{{ formatCurrency(totals.impuesto) }}</span>
              </div>
              <div class="border-t border-gray-200 pt-3 mt-3">
                <div class="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{{ formatCurrency(totals.total) }}</span>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="router.push('/facturas')">
          Cancelar
        </AppButton>
        <AppButton type="submit" variant="primary" :loading="loading">
          Guardar Factura
        </AppButton>
      </div>
    </form>

    <!-- Modal de Nuevo Cliente -->
    <AppModal
      v-model:show="showCustomerModal"
      title="Nuevo Cliente"
      subtitle="Registre un nuevo cliente"
      size="lg"
    >
      <CustomerForm
        @submit="handleCustomerSubmit"
        @cancel="showCustomerModal = false"
      />
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoicesStore } from '@/stores/invoices'
import { useCustomersStore } from '@/stores/customers'
//import { useProductsStore } from '@/stores/products'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const invoicesStore = useInvoicesStore()
const customersStore = useCustomersStore()
//const productsStore = useProductsStore()

const loading = ref(false)
const showCustomerModal = ref(false)

const form = ref({
  clienteId: '',
  fechaEmision: new Date().toISOString().split('T')[0],
  fechaVencimiento: '',
  metodoPago: '',
  estado: 'pendiente',
  items: [
    {
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      subtotal: 0
    }
  ],
  notas: ''
})

// Datos de ejemplo
const customers = ref([
  { _id: '1', nombre: 'Juan Pérez', numeroDocumento: '12345678' },
  { _id: '2', nombre: 'María García', numeroDocumento: '87654321' }
])

const products = ref([
  { _id: '1', nombre: 'Laptop Dell XPS 15', precio: 1500.00, stock: 25 },
  { _id: '2', nombre: 'Mouse Logitech MX', precio: 100.00, stock: 50 },
  { _id: '3', nombre: 'Teclado Mecánico', precio: 150.00, stock: 30 }
])

const totals = computed(() => {
  const subtotal = form.value.items.reduce((sum, item) => sum + item.subtotal, 0)
  const impuesto = subtotal * 0.18
  const total = subtotal + impuesto

  return {
    subtotal,
    impuesto,
    total
  }
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value)
}

const addItem = () => {
  form.value.items.push({
    productoId: '',
    cantidad: 1,
    precioUnitario: 0,
    descuento: 0,
    subtotal: 0
  })
}

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const updateItemFromProduct = (index) => {
  const item = form.value.items[index]
  const product = products.value.find(p => p._id === item.productoId)

  if (product) {
    item.precioUnitario = product.precio
    calculateItemSubtotal(index)
  }
}

const calculateItemSubtotal = (index) => {
  const item = form.value.items[index]
  item.subtotal = item.cantidad * item.precioUnitario * (1 - item.descuento / 100)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const invoiceData = {
      ...form.value,
      subtotal: totals.value.subtotal,
      impuesto: 18,
      montoImpuesto: totals.value.impuesto,
      total: totals.value.total
    }

    await invoicesStore.createInvoice(invoiceData)
    router.push('/facturas')
  } catch (error) {
    console.error('Error al crear factura:', error)
  } finally {
    loading.value = false
  }
}

const handleCustomerSubmit = async (customerData) => {
  try {
    const newCustomer = await customersStore.createCustomer(customerData)
    customers.value.push(newCustomer)
    form.value.clienteId = newCustomer._id
    showCustomerModal.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(() => {
  // Cargar datos
  // customersStore.fetchCustomers()
  // productsStore.fetchProducts()
})
</script>
