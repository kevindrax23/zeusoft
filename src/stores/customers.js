import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref([])
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchCustomers = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/customers', { params: filters })
      customers.value = response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al cargar clientes'
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (customerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/customers', customerData)
      customers.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al crear cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id, customerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/customers/${id}`, customerData)
      const index = customers.value.findIndex(c => c._id === id)
      if (index !== -1) {
        customers.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al actualizar cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/customers/${id}`)
      customers.value = customers.value.filter(c => c._id !== id)
    } catch (err) {
      error.value = err.mensaje || 'Error al eliminar cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    currentCustomer,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})
