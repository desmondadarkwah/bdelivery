import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('swg_admin_token')
  const riderToken = localStorage.getItem('swg_rider_token')
  const customerToken = localStorage.getItem('swg_customer_token')
  const url = config.url || ''

  const isRiderRoute =
    url.includes('/riders/me') ||
    url.includes('/orders/rider') ||
    url.includes('/orders/available') ||
    url.includes('/self-assign') ||
    url.includes('/proof')

  const isCustomerRoute =
    url.includes('/customers/me') ||
    url.includes('/customers/orders') ||
    url.includes('/customers/me/password')

  if (isRiderRoute && riderToken) {
    config.headers.Authorization = `Bearer ${riderToken}`
  } else if (isCustomerRoute && customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const status = error.response?.status

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/riders/login') ||
      url.includes('/customers/login') ||
      url.includes('/customers/register')

    if (status === 401 && !isAuthEndpoint) {
      const isRiderRoute = url.includes('/riders/me') || url.includes('/orders/rider') || url.includes('/orders/available') || url.includes('/self-assign') || url.includes('/proof')
      const isCustomerRoute = url.includes('/customers/me') || url.includes('/customers/orders')

      if (isRiderRoute) {
        localStorage.removeItem('swg_rider_token')
        window.location.href = '/rider/login'
      } else if (isCustomerRoute) {
        localStorage.removeItem('swg_customer_token')
        window.location.href = '/login'
      } else {
        localStorage.removeItem('swg_admin_token')
        window.location.href = '/admin/login'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

// ─── AUTH ─────────────────────────────────────────────
export const loginAdmin = async (payload) => {
  const { data } = await axiosInstance.post('/api/auth/login', payload)
  return data
}

// ─── ORDERS ───────────────────────────────────────────
export const createOrder = async (formData) => {
  const { data } = await axiosInstance.post('/api/orders', formData)
  return data.data
}

export const trackOrder = async (orderID) => {
  const { data } = await axiosInstance.get(`/api/orders/track/${orderID}`)
  return data.data
}

export const getAllOrders = async (status) => {
  const url = status ? `/api/orders?status=${status}` : '/api/orders'
  const { data } = await axiosInstance.get(url)
  return data.data || []
}

export const assignRider = async (orderId, riderId) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/assign`, { riderId })
  return data.data
}

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/status`, { status })
  return data.data
}

export const uploadProof = async (orderId, formData) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/proof`, formData)
  return data.data
}

export const getStats = async () => {
  const { data } = await axiosInstance.get('/api/orders/stats')
  return data.data
}

// ─── RIDERS ───────────────────────────────────────────
export const loginRider = async (payload) => {
  const { data } = await axiosInstance.post('/api/riders/login', payload)
  return data
}

export const getRiderMe = async () => {
  const { data } = await axiosInstance.get('/api/riders/me')
  return data.data
}

export const getRiderOrders = async () => {
  const { data } = await axiosInstance.get('/api/orders/rider')
  return data.data || []
}

export const getAllRiders = async () => {
  const { data } = await axiosInstance.get('/api/riders')
  return data.data || []
}

export const createRider = async (payload) => {
  const { data } = await axiosInstance.post('/api/riders', payload)
  return data.data
}

export const updateRiderStatus = async (id, status) => {
  const { data } = await axiosInstance.put(`/api/riders/${id}/status`, { status })
  return data.data
}

export const deleteRider = async (id) => {
  const { data } = await axiosInstance.delete(`/api/riders/${id}`)
  return data
}

// ─── SETTINGS ─────────────────────────────────────────
export const fetchSettings = async () => {
  const { data } = await axiosInstance.get('/api/settings')
  return data.data
}

export const updateSettings = async (payload) => {
  const { data } = await axiosInstance.put('/api/settings', payload)
  return data.data
}

// ─── ADMIN PASSWORD ───────────────────────────────────
export const changeAdminPassword = async (payload) => {
  const { data } = await axiosInstance.put('/api/auth/change-password', payload)
  return data
}

export const getAvailableOrders = async () => {
  const { data } = await axiosInstance.get('/api/orders/available')
  return data.data || []
}

export const selfAssignOrder = async (orderId) => {
  const { data } = await axiosInstance.put(`/api/orders/${orderId}/self-assign`)
  return data.data
}

// ─── CUSTOMER AUTH ────────────────────────────────────
export const registerCustomer = async (payload) => {
  const { data } = await axiosInstance.post('/api/customers/register', payload)
  return data
}

export const loginCustomer = async (payload) => {
  const { data } = await axiosInstance.post('/api/customers/login', payload)
  return data
}

export const fetchCustomerMe = async () => {
  const { data } = await axiosInstance.get('/api/customers/me')
  return data.customer
}

export const updateCustomerProfile = async (payload) => {
  const { data } = await axiosInstance.put('/api/customers/me', payload)
  return data.customer
}

export const changeCustomerPassword = async (payload) => {
  const { data } = await axiosInstance.put('/api/customers/me/password', payload)
  return data
}

export const fetchCustomerOrders = async () => {
  const { data } = await axiosInstance.get('/api/customers/orders')
  return data.data || []
}

export const fetchAllCustomers = async () => {
  const { data } = await axiosInstance.get('/api/customers/all')
  console.log('data: ', data);
  return data.data || []
}

export const deleteCustomer = async (id) => {
  const { data } = await axiosInstance.delete(`/api/customers/${id}`)
  return data
}