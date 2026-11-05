import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'
import { ehCliente } from '../perfil.js'

export default function Menu() {
  const { sessao, sair } = useAuth()
  const navegar = useNavigate()
  const cliente = ehCliente(sessao)

  function deslogar() {
    sair()
    navegar('/login')
  }

  return (
    <header className="menu">
      <strong>Getaway Car Rentals</strong>
      <nav>
        <Link to="/">{cliente ? 'Catálogo' : 'Painel'}</Link>
        {cliente && <Link to="/meus-pedidos">Meus pedidos</Link>}
      </nav>
      <span>
        {sessao.login} ({sessao.perfil}) <button onClick={deslogar}>Sair</button>
      </span>
    </header>
  )
}