import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RotaPorPerfil from './components/RotaPorPerfil.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Inicio from './pages/Inicio.jsx'
import CarroDetalhe from './pages/CarroDetalhe.jsx'
import MeusPedidos from './pages/MeusPedidos.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Inicio />} />
        <Route
          path="/carros/:id"
          element={<RotaPorPerfil apenasCliente><CarroDetalhe /></RotaPorPerfil>}
        />
        <Route
          path="/meus-pedidos"
          element={<RotaPorPerfil apenasCliente><MeusPedidos /></RotaPorPerfil>}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}