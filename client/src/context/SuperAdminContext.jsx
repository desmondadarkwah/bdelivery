import { createContext, useContext, useState } from 'react'

const SuperAdminContext = createContext()

export function SuperAdminProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('bdv_super_token') || null)
  const [superAdmin, setSuperAdmin] = useState(
    localStorage.getItem('bdv_super_admin')
      ? JSON.parse(localStorage.getItem('bdv_super_admin'))
      : null
  )

  const login = (tokenValue, adminData) => {
    localStorage.setItem('bdv_super_token', tokenValue)
    if (adminData) localStorage.setItem('bdv_super_admin', JSON.stringify(adminData))
    setToken(tokenValue)
    setSuperAdmin(adminData)
  }

  const logout = () => {
    localStorage.removeItem('bdv_super_token')
    localStorage.removeItem('bdv_super_admin')
    setToken(null)
    setSuperAdmin(null)
  }

  return (
    <SuperAdminContext.Provider value={{ token, superAdmin, login, logout, isLoggedIn: !!token }}>
      {children}
    </SuperAdminContext.Provider>
  )
}

export const useSuperAdmin = () => useContext(SuperAdminContext)