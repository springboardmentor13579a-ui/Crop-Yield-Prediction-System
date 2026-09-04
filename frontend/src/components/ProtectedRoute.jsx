import { Navigate } from 'react-router-dom'
import { getStoredUser, getToken } from '../api'

export default function ProtectedRoute({ role, children }) {
  const user = getStoredUser()
  if (!getToken() || !user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}
