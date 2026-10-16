import { Routes, Route } from 'react-router-dom'
import { useTenant } from './context/TenantContext'
import Landing from './pages/Landing'
import BookDelivery from './pages/BookDelivery'
import TrackOrder from './pages/TrackOrder'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import RiderLogin from './pages/RiderLogin'
import RiderDashboard from './pages/RiderDashboard'
import CustomerLogin from './pages/CustomerLogin'
import CustomerRegister from './pages/CustomerRegister'
import CustomerAccount from './pages/CustomerAccount'
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import NotFound from './pages/NotFound'
import BdeliveryLanding from './pages/BdeliveryLanding'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import RiderProtectedRoute from './components/RiderProtectedRoute'
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute'

function App() {
  const { tenant, loading, error } = useTenant()

  // Show Bdelivery marketing page if no tenant found
  if (!loading && (error || !tenant)) {
    return <BdeliveryLanding />
  }

  // Show nothing while tenant is loading
  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/book" element={<BookDelivery />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/track/:orderID" element={<TrackOrder />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/account" element={<CustomerAccount />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      <Route path="/rider/login" element={<RiderLogin />} />
      <Route path="/rider" element={
        <RiderProtectedRoute>
          <RiderDashboard />
        </RiderProtectedRoute>
      } />
      <Route path="/super/login" element={<SuperAdminLogin />} />
      <Route path="/super" element={
        <SuperAdminProtectedRoute>
          <SuperAdminDashboard />
        </SuperAdminProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App