import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'

export default function ProtectedRoute({ children }) {
  const { sessao } = useAuth()
  return sessao ? children : <Navigate to="/login" replace />
}