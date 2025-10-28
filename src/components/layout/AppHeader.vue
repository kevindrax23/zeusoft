<template>
  <header class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left section -->
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            @click="$emit('toggle-sidebar')"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <div class="hidden sm:block">
            <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="hidden md:block relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              class="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <!-- Notifications -->
          <button
            type="button"
            class="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BellIcon class="h-6 w-6" />
            <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              @click="showUserMenu = !showUserMenu"
            >
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {{ userInitials }}
              </div>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                v-click-outside="() => showUserMenu = false"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
              >
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Mi Perfil
                </a>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Configuración
                </a>
                <div class="border-t border-gray-200 my-1"></div>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/productos': 'Productos',
    '/facturas': 'Facturas',
    '/clientes': 'Clientes',
    '/reportes': 'Reportes'
  }
  return titles[route.path] || 'Panel de Control'
})

const userInitials = computed(() => {
  const name = authStore.user?.nombre || 'Usuario'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Directiva para cerrar el menú al hacer clic fuera
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>
