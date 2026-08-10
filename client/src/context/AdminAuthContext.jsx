import { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('swg_admin_token') || null)
  const [adminTenant, setAdminTenant] = useState(
    localStorage.getItem('swg_admin_tenant')
      ? JSON.parse(localStorage.getItem('swg_admin_tenant'))
      : null
  )

  const login = (tokenValue, tenantData) => {
    localStorage.setItem('swg_admin_token', tokenValue)
    if (tenantData) localStorage.setItem('swg_admin_tenant', JSON.stringify(tenantData))
    setToken(tokenValue)
    setAdminTenant(tenantData)
  }

  const logout = () => {
    localStorage.removeItem('swg_admin_token')
    localStorage.removeItem('swg_admin_tenant')
    setToken(null)
    setAdminTenant(null)
  }

  return (
    <AdminAuthContext.Provider value={{ token, adminTenant, login, logout, isLoggedIn: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)