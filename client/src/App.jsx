import { Routes, Route } from 'react-router-dom'
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
import NotFound from './pages/NotFound'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import RiderProtectedRoute from './components/RiderProtectedRoute'

function App() {
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App