import { createContext, useContext, useState } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('swg_admin_token') || null)

  const login = (tokenValue) => {
    localStorage.setItem('swg_admin_token', tokenValue)
    setToken(tokenValue)
  }

  const logout = () => {
    localStorage.removeItem('swg_admin_token')
    setToken(null)
  }

  return (
    <AdminAuthContext.Provider value={{ token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)