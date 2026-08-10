import { Navigate } from 'react-router-dom'
import { useSuperAdmin } from '../context/SuperAdminContext'

export default function SuperAdminProtectedRoute({ children }) {
  const { isLoggedIn } = useSuperAdmin()
  if (!isLoggedIn) return <Navigate to="/super/login" replace />
  return children
}