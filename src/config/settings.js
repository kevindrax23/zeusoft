export const appSettings = {
  // Configuración de país
  country: {
    name: 'Colombia',
    code: 'CO',
    currency: 'COP',
    locale: 'es-CO'
  },

  // Configuración de impuestos
  tax: {
    name: 'IVA',
    rate: 0.19, // 19%
    percentage: 19
  },

  // Configuración de empresa (por defecto)
  company: {
    nombre: 'ZEUSOFT S.A.S.',
    nit: '900123456-7',
    direccion: 'Calle 100 #15-20, Bogotá - Colombia',
    telefono: '(+57) 601 234 5678',
    email: 'ventas@zeusoft.com',
    ciudad: 'Bogotá'
  },

  // Tipos de documento en Colombia
  documentTypes: [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ]
}

// Función helper para formatear moneda
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '$ 0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Función helper para formatear fecha
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    })
  } catch {
    return 'N/A'
  }
}

// Función helper para formatear fecha y hora
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}
