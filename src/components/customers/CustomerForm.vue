<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Documento *</label>
        <select
          v-model="form.tipoDocumento"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
          required
        >
          <option value="">Seleccione</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="CE">Cédula de Extranjería</option>
          <option value="NIT">NIT</option>
          <option value="PASAPORTE">Pasaporte</option>
        </select>
      </div>

      <AppInput
        v-model="form.numeroDocumento"
        label="Número de Documento"
        placeholder="1234567890"
        required
        :error="errors.numeroDocumento"
      />
    </div>

    <AppInput
      v-model="form.nombre"
      label="Nombre Completo / Razón Social"
      placeholder="Juan Pérez García"
      required
      :error="errors.nombre"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput
        v-model="form.email"
        type="email"
        label="Correo Electrónico"
        placeholder="cliente@email.com"
      />

      <AppInput
        v-model="form.telefono"
        type="tel"
        label="Teléfono / Celular"
        placeholder="3001234567"
      />
    </div>

    <div class="border-t border-gray-200 pt-4">
      <h4 class="font-semibold text-gray-900 mb-4">Dirección</h4>

      <div class="space-y-4">
        <AppInput
          v-model="form.direccion.calle"
          label="Dirección"
          placeholder="Calle 100 #15-20"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppInput
            v-model="form.direccion.ciudad"
            label="Ciudad"
            placeholder="Bogotá"
          />

          <AppInput
            v-model="form.direccion.codigoPostal"
            label="Código Postal"
            placeholder="110111"
          />

          <AppInput
            v-model="form.direccion.pais"
            label="País"
            placeholder="Colombia"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="flex items-center cursor-pointer">
        <input
          v-model="form.activo"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
        />
        <span class="ml-2 text-sm text-gray-700">Cliente activo</span>
      </label>
    </div>

    <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      <AppButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancelar
      </AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ customer ? 'Actualizar' : 'Crear' }} Cliente
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps({
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  tipoDocumento: '',
  numeroDocumento: '',
  nombre: '',
  email: '',
  telefono: '',
  direccion: {
    calle: '',
    ciudad: '',
    codigoPostal: '',
    pais: 'Colombia'
  },
  activo: true
})

const errors = ref({})
const loading = ref(false)

watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    form.value = {
      ...newCustomer,
      direccion: newCustomer.direccion || {
        calle: '',
        ciudad: '',
        codigoPostal: '',
        pais: 'Colombia'
      }
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  errors.value = {}

  if (!form.value.numeroDocumento) {
    errors.value.numeroDocumento = 'El número de documento es obligatorio'
    return
  }

  if (!form.value.nombre) {
    errors.value.nombre = 'El nombre es obligatorio'
    return
  }

  emit('submit', form.value)
}
</script>
