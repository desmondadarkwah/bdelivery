import { createContext, useContext, useState } from 'react'

const RiderAuthContext = createContext()

export function RiderAuthProvider({ children }) {
  const [token, setToken]   = useState(localStorage.getItem('swg_rider_token') || null)
  const [rider, setRider]   = useState(null)

  const login = (tokenValue, riderData) => {
    localStorage.setItem('swg_rider_token', tokenValue)
    setToken(tokenValue)
    setRider(riderData)
  }

  const logout = () => {
    localStorage.removeItem('swg_rider_token')
    setToken(null)
    setRider(null)
  }

  return (
    <RiderAuthContext.Provider value={{ token, rider, login, logout, isLoggedIn: !!token }}>
      {children}
    </RiderAuthContext.Provider>
  )
}

export const useRiderAuth = () => useContext(RiderAuthContext)