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
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Sidebar -->
  <Transition
    enter-active-class="transition-transform duration-300"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="show || !isMobile"
      class="fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 lg:translate-x-0 flex flex-col shadow-lg"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center px-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <ShoppingBagIcon class="h-5 w-5 text-white" />
          </div>
          <span class="text-xl font-bold text-gray-900">FacturaApp</span>
        </div>
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
              'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-150'
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600',
                'h-5 w-5 flex-shrink-0'
              ]"
            />
            {{ item.name }}
            <span
              v-if="item.badge"
              class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
            >
              {{ item.badge }}
            </span>
          </a>
        </router-link>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ChevronUpDownIcon
} from '@heroicons/vue/24/outline'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const isMobile = computed(() => window.innerWidth < 1024)

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, to: '/' },
  { name: 'Productos', icon: CubeIcon, to: '/productos', badge: '12' },
  { name: 'Facturas', icon: DocumentTextIcon, to: '/facturas' },
  { name: 'Clientes', icon: UsersIcon, to: '/clientes' },
  { name: 'Reportes', icon: ChartBarIcon, to: '/reportes' }
]

const userName = computed(() => authStore.user?.nombre || 'Usuario')
const userEmail = computed(() => authStore.user?.email || 'usuario@email.com')
const userInitials = computed(() => {
  const name = userName.value
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const navigateTo = (path) => {
  router.push(path)
  if (isMobile.value) {
    emit('close')
  }
}
</script>
