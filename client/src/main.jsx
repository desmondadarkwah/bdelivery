import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TenantProvider } from './context/TenantContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { RiderAuthProvider } from './context/RiderAuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { SuperAdminProvider } from './context/SuperAdminContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <SuperAdminProvider>
          <AdminAuthProvider>
            <RiderAuthProvider>
              <CustomerAuthProvider>
                <App />
              </CustomerAuthProvider>
            </RiderAuthProvider>
          </AdminAuthProvider>
        </SuperAdminProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>
)