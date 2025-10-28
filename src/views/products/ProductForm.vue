<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput
        v-model="form.codigo"
        label="Código"
        placeholder="PROD-001"
        required
        :error="errors.codigo"
      />

      <AppInput
        v-model="form.nombre"
        label="Nombre del Producto"
        placeholder="Laptop Dell XPS 15"
        required
        :error="errors.nombre"
      />
    </div>

    <AppInput
      v-model="form.descripcion"
      type="textarea"
      label="Descripción"
      placeholder="Descripción detallada del producto..."
      :rows="3"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label">Categoría</label>
        <select v-model="form.categoria" class="input" required>
          <option value="">Seleccione una categoría</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
          <option value="alimentos">Alimentos</option>
          <option value="hogar">Hogar</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div>
        <label class="label">Estado</label>
        <select v-model="form.activo" class="input">
          <option :value="true">Activo</option>
          <option :value="false">Inactivo</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AppInput
        v-model="form.precio"
        type="number"
        step="0.01"
        label="Precio"
        placeholder="0.00"
        required
      />

      <AppInput
        v-model="form.costo"
        type="number"
        step="0.01"
        label="Costo"
        placeholder="0.00"
        required
      />

      <AppInput
        v-model="form.stock"
        type="number"
        label="Stock"
        placeholder="0"
        required
      />
    </div>

    <AppInput
      v-model="form.stockMinimo"
      type="number"
      label="Stock Mínimo"
      placeholder="10"
      hint="Se enviará una alerta cuando el stock esté por debajo de este valor"
    />

    <div class="flex items-center justify-end gap-3 pt-4">
      <AppButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancelar
      </AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ product ? 'Actualizar' : 'Crear' }} Producto
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: 0,
  costo: 0,
  stock: 0,
  stockMinimo: 10,
  activo: true
})

const errors = ref({})
const loading = ref(false)

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = { ...newProduct }
  }
}, { immediate: true })

const handleSubmit = () => {
  errors.value = {}

  if (!form.value.codigo) {
    errors.value.codigo = 'El código es obligatorio'
    return
  }

  if (!form.value.nombre) {
    errors.value.nombre = 'El nombre es obligatorio'
    return
  }

  emit('submit', form.value)
}
</script>
