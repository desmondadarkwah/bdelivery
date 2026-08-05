import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { RiderAuthProvider } from './context/RiderAuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <RiderAuthProvider>
          <CustomerAuthProvider>
            <App />
          </CustomerAuthProvider>
        </RiderAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)