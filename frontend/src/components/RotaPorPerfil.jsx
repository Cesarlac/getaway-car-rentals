import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'
import { ehCliente } from '../perfil.js'

export default function RotaPorPerfil({ apenasCliente, children }) {
  const { sessao } = useAuth()
  if (apenasCliente && !ehCliente(sessao)) return <Navigate to="/" replace />
  return children
}