import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'productos',
        name: 'Products',
        component: () => import('@/views/products/ProductsView.vue')
      },
      {
        path: 'productos/:id',
        name: 'ProductDetail',
        component: () => import('@/components/products/ProductDetailView.vue')
      },
      {
        path: 'facturas',
        name: 'Invoices',
        component: () => import('@/views/invoices/InvoicesView.vue')
      },
      {
        path: 'facturas/crear',
        name: 'CreateInvoice',
        component: () => import('@/views/invoices/CreateInvoiceView.vue')
      },
      {
        path: 'facturas/:id',
        name: 'InvoiceDetail',
        component: () => import('@/views/invoices/InvoiceDetailView.vue')
      },
      {
        path: 'clientes',
        name: 'Customers',
        component: () => import('@/views/customers/CustomersView.vue')
      },
      {
        path: 'clientes/:id',
        name: 'CustomerDetail',
        component: () => import('@/views/customers/CustomerDetailView.vue')
      },
      {
        path: 'reportes',
        name: 'Reports',
        component: () => import('@/views/reports/ReportsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
