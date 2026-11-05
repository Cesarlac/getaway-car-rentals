import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'

export default function Menu() {
  const { sessao, sair } = useAuth()
  const navegar = useNavigate()

  function deslogar() {
    sair()
    navegar('/login')
  }

  return (
    <header className="menu">
      <strong>Getaway Car Rentals</strong>
      <nav>
        <Link to="/">{sessao.perfil === 'CLIENTE' || sessao.perfil === 'Cliente' ? 'Catálogo' : 'Painel'}</Link>
        {(sessao.perfil === 'CLIENTE' || sessao.perfil === 'Cliente') && <Link to="/meus-pedidos">Meus pedidos</Link>}
      </nav>
      <span>
        {sessao.login} ({sessao.perfil}) <button onClick={deslogar}>Sair</button>
      </span>
    </header>
  )
}