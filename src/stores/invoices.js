import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const currentInvoice = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchInvoices = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/invoices', { params: filters })
      invoices.value = response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al cargar facturas'
    } finally {
      loading.value = false
    }
  }

  const getInvoiceById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/invoices/${id}`)
      currentInvoice.value = response.data
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al cargar factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInvoice = async (invoiceData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/invoices', invoiceData)
      invoices.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al crear factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInvoice = async (id, invoiceData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData)
      const index = invoices.value.findIndex(i => i._id === id)
      if (index !== -1) {
        invoices.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al actualizar factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteInvoice = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/invoices/${id}`)
      invoices.value = invoices.value.filter(i => i._id !== id)
    } catch (err) {
      error.value = err.mensaje || 'Error al eliminar factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    invoices,
    currentInvoice,
    loading,
    error,
    fetchInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice
  }
})
