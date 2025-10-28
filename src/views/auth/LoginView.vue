<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
    <div class="w-full max-w-md">
      <!-- Logo y Título -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
          <ShoppingBagIcon class="h-8 w-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">FacturaApp</h1>
        <p class="text-gray-600">Sistema de Facturación e Inventario</p>
      </div>

      <!-- Formulario de Login -->
      <AppCard padding="lg">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <AppInput
              v-model="form.email"
              type="email"
              label="Correo Electrónico"
              placeholder="usuario@ejemplo.com"
              :icon-left="EnvelopeIcon"
              required
              :error="errors.email"
            />
          </div>

          <div>
            <AppInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              placeholder="••••••••"
              :icon-left="LockClosedIcon"
              required
              :error="errors.password"
            >
              <template #iconRight>
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                  <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                </button>
              </template>
            </AppInput>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-600">Recordarme</span>
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <AppAlert v-if="authStore.error" variant="danger" :closable="false">
            {{ authStore.error }}
          </AppAlert>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="authStore.loading"
            :disabled="authStore.loading"
            full-width
          >
            Iniciar Sesión
          </AppButton>
        </form>
      </AppCard>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-600 mt-6">
        © {{ currentYear }} FacturaApp. Todos los derechos reservados.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppCard from '@/components/common/AppCard.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import {
  ShoppingBagIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const errors = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const currentYear = computed(() => new Date().getFullYear())

const handleLogin = async () => {
  // Validación básica
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'El correo es obligatorio'
    return
  }

  if (!form.value.password) {
    errors.value.password = 'La contraseña es obligatoria'
    return
  }

  const success = await authStore.login({
    email: form.value.email,
    password: form.value.password
  })

  if (success) {
    router.push('/dashboard')
  }
}
</script>
