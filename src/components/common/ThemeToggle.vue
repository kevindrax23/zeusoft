<template>
  <button
    @click="themeStore.toggleTheme()"
    class="p-2.5 rounded-lg transition-all duration-300 hover:scale-110"
    :class="themeStore.isDark
      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
    :title="themeStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <SunIcon v-if="themeStore.isDark" class="h-5 w-5" />
    <MoonIcon v-else class="h-5 w-5" />
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()
</script>
