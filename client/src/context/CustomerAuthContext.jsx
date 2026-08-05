import { createContext, useContext, useState, useEffect } from 'react'
import { fetchCustomerMe } from '../utils/api'

const CustomerAuthContext = createContext()

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [token, setToken]       = useState(localStorage.getItem('swg_customer_token') || null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (token) {
      fetchCustomerMe()
        .then(data => setCustomer(data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (tokenValue, customerData) => {
    localStorage.setItem('swg_customer_token', tokenValue)
    setToken(tokenValue)
    setCustomer(customerData)
  }

  const logout = () => {
    localStorage.removeItem('swg_customer_token')
    setToken(null)
    setCustomer(null)
  }

  const updateCustomer = (data) => setCustomer(prev => ({ ...prev, ...data }))

  return (
    <CustomerAuthContext.Provider value={{ customer, token, login, logout, loading, updateCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)