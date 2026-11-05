import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Catalogo from './pages/Catalogo.jsx'
import CarroDetalhe from './pages/CarroDetalhe.jsx'
import MeusPedidos from './pages/MeusPedidos.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Catalogo />} />
        <Route path="/carros/:id" element={<CarroDetalhe />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}