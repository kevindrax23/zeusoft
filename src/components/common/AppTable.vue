<template>
  <div class="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
    <div v-if="title || $slots.actions" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <slot name="actions" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="(column, index) in columns"
              :key="index"
              scope="col"
              class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, rowIndex) in data"
            :key="rowIndex"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="(column, colIndex) in columns"
              :key="colIndex"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="item[column.key]">
                {{ item[column.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item" />
            </td>
          </tr>

          <tr v-if="!data || data.length === 0">
            <td
              :colspan="columns.length + ($slots.actions ? 1 : 0)"
              class="px-6 py-12 text-center text-sm text-gray-500"
            >
              <div class="flex flex-col items-center gap-2">
                <svg class="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  emptyMessage: {
    type: String,
    default: 'No hay datos disponibles'
  }
})
</script>
