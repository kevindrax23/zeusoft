<template>
  <!-- Overlay para móvil -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show && isMobile"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300',
      isCollapsed && !show ? 'w-16' : 'w-64',
      'lg:translate-x-0',
      show || !isMobile ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="logo">
      <img class="zeus" src="../../assets/images/logo.svg" alt="" />
      <span v-if="!isCollapsed || show" class="text-xl font-bold text-gray-900 whitespace-nowrap">
        ZeusSoft
      </span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.to"
        v-slot="{ isActive }"
        custom
      >
        <a
          :href="item.to"
          @click.prevent="navigateTo(item.to)"
          :class="[
            isActive
              ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
              : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300',
            'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-150',
            isCollapsed && !show ? 'justify-center' : '',
          ]"
          :title="isCollapsed && !show ? item.name : ''"
        >
          <component
            :is="item.icon"
            :class="[
              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600',
              'h-5 w-5 flex-shrink-0',
            ]"
          />
          <span v-if="!isCollapsed || show" class="flex-1">
            {{ item.name }}
          </span>
          <span
            v-if="item.badge && (!isCollapsed || show)"
            class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
          >
            {{ item.badge }}
          </span>
        </a>
      </router-link>
    </nav>

    <!-- User Section y Logout -->
    <div class="border-t border-gray-200">
      <!-- User Info -->
      <div v-if="!isCollapsed || show" class="p-4">
        <div
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
          >
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
        </div>
      </div>

      <!-- Avatar solo para móvil colapsado -->
      <div v-if="isCollapsed && !show" class="p-4 flex justify-center">
        <div
          class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold"
        >
          {{ userInitials }}
        </div>
      </div>

      <!-- Logout Button -->
      <div class="p-4 pt-0">
        <button
          @click="handleLogout"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150',
            'text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300',
            isCollapsed && !show ? 'justify-center' : '',
          ]"
          :title="isCollapsed && !show ? 'Cerrar Sesión' : ''"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5 flex-shrink-0" />
          <span v-if="!isCollapsed || show">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 1024)
const isCollapsed = computed(() => isMobile.value)

// Actualizar ancho de ventana al redimensionar
const updateWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, to: '/dashboard' },
  { name: 'Productos', icon: CubeIcon, to: '/productos', badge: '12' },
  { name: 'Facturas', icon: DocumentTextIcon, to: '/facturas' },
  { name: 'Clientes', icon: UsersIcon, to: '/clientes' },
  { name: 'Reportes', icon: ChartBarIcon, to: '/reportes' },
]

const userName = computed(() => authStore.user?.nombre || 'Usuario')
const userEmail = computed(() => authStore.user?.email || 'usuario@email.com')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const navigateTo = (path) => {
  router.push(path)
  if (isMobile.value) {
    emit('close')
  }
}

const handleLogout = () => {
  // Confirmar logout
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
    if (isMobile.value) {
      emit('close')
    }
  }
}
</script>

<style scoped>
.logo {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-right: 20px;
  gap:10px
}

.zeus {
  width: 50px;
}
</style>
