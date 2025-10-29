<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg transition-transform duration-300 w-64',
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div
        class="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <img src="../../assets/images/logo.svg" alt="" class="w-12 h-12" />
          <span class="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            ZeusSoft
          </span>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <!-- Botón cerrar solo en móvil -->
          <button
            v-if="isMobile"
            @click="sidebarOpen = false"
            class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.path"
          @click="onNavigate"
          :class="[
            isActive(item.path)
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-l-4 border-primary-600 dark:border-primary-500'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600',
            'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-150',
          ]"
        >
          <component
            :is="item.icon"
            :class="[
              isActive(item.path)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              'h-5 w-5 flex-shrink-0',
            ]"
          />
          <span class="flex-1">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User Section y Logout -->
      <div class="border-t border-gray-200 dark:border-gray-700">
        <!-- User Info -->
        <div class="p-4">
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div
              class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
            >
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ userName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ userEmail }}</p>
            </div>
          </div>
        </div>

        <!-- Logout Button -->
        <!-- Logout Button -->
        <div class="p-4 pt-0">
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div :class="['transition-all duration-300', isMobile ? 'ml-0' : 'ml-64']">
      <!-- Header -->
      <header
        class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 flex items-center justify-between transition-colors duration-300"
      >
        <!-- Botón hamburguesa para móvil -->
        <button
          v-if="isMobile"
          @click="sidebarOpen = true"
          class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Bars3Icon class="h-6 w-6" />
        </button>

        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ currentPageTitle }}</h1>

        <div class="w-10"></div>
      </header>

      <!-- Page Content -->
      <main class="p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import {
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 1024)

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Productos', path: '/productos', icon: CubeIcon },
  { name: 'Facturas', path: '/facturas', icon: DocumentTextIcon },
  { name: 'Clientes', path: '/clientes', icon: UsersIcon },
  { name: 'Reportes', path: '/reportes', icon: ChartBarIcon },
]

const userName = computed(() => authStore.user?.nombre || 'Administrador')
const userEmail = computed(() => authStore.user?.email || 'admin@zeusoft.com')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const currentPageTitle = computed(() => {
  const currentRoute = navigation.find((item) => {
    if (item.path === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(item.path)
  })
  return currentRoute?.name || 'Dashboard'
})

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const onNavigate = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
    if (isMobile.value) {
      sidebarOpen.value = false
    }
  }
}

const updateWidth = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>
