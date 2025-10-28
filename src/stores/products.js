import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProducts = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/products', { params: filters })
      products.value = response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al cargar productos'
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/products', productData)
      products.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al crear producto'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/products/${id}`, productData)
      const index = products.value.findIndex(p => p._id === id)
      if (index !== -1) {
        products.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.mensaje || 'Error al actualizar producto'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p._id !== id)
    } catch (err) {
      error.value = err.mensaje || 'Error al eliminar producto'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
