import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Error del servidor
      if (error.response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      }

      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Error de red
      return Promise.reject({ mensaje: 'Error de conexión con el servidor' })
    } else {
      return Promise.reject({ mensaje: 'Error desconocido' })
    }
  }
)

export default api
