import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const TenantContext = createContext()

const getSubdomain = () => {
  const host = window.location.hostname // e.g. swiftbygwyn.bdelivery.com or localhost
  
  // Local development — use localStorage to simulate subdomain
  if (host === 'localhost' || host === '127.0.0.1') {
    return localStorage.getItem('dev_subdomain') || 'swiftbygwyn'
  }

  const parts = host.split('.')
  // e.g. swiftbygwyn.bdelivery.com → ['swiftbygwyn', 'bdelivery', 'com']
  if (parts.length >= 3) return parts[0]

  return null
}

export function TenantProvider({ children }) {
  const [tenant, setTenant]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const subdomain = getSubdomain()

  useEffect(() => {
    if (!subdomain) { setLoading(false); return }
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tenant/${subdomain}`)
      .then(res => {
        setTenant(res.data.data)
        // Apply brand color to CSS variable
        document.documentElement.style.setProperty('--brand', res.data.data.brandColor || '#f97316')
      })
      .catch(err => {
        setError('Tenant not found.')
      })
      .finally(() => setLoading(false))
  }, [subdomain])

  return (
    <TenantContext.Provider value={{ tenant, loading, error, subdomain }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => useContext(TenantContext)