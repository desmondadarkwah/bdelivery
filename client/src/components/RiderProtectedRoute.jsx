import { Navigate } from 'react-router-dom'
import { useRiderAuth } from '../context/RiderAuthContext'

export default function RiderProtectedRoute({ children }) {
  const { isLoggedIn } = useRiderAuth()
  if (!isLoggedIn) return <Navigate to="/rider/login" replace />
  return children
}