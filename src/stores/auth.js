import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return true
    } catch (err) {
      error.value = err.mensaje || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      user.value = response.user
    } catch {
      logout()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
})
