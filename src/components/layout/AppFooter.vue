<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-sm text-gray-500">
          © {{ currentYear }} FacturaApp. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Ayuda
          </a>
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Documentación
          </a>
          <a href="#" class="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Contacto
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
