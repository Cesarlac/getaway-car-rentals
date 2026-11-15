import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'
import { ehCliente } from '../perfil.js'
import SquishSwitch from './SquishSwitch.jsx'

export default function Menu() {
  const { sessao, sair } = useAuth()
  const navegar = useNavigate()
  const cliente = ehCliente(sessao)
  const classe = ({ isActive }) => (isActive ? 'ativo' : '')
  
  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem('tema') === 'escuro')

  useEffect(() => {
    if (temaEscuro) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tema', 'escuro')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tema', 'claro')
    }
  }, [temaEscuro])

  function deslogar() {
    sair()
    navegar('/login')
  }

  // Capitaliza a primeira letra do nome do usuário
  const nomeFormatado = sessao?.login ? sessao.login.charAt(0).toUpperCase() + sessao.login.slice(1) : '';

  return (
    <header className="menu">
      <div className="menu-int">
        <Link to="/" aria-label="Página inicial" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none' }}>
          <img 
            src="https://vlzwqjvoftxptsmlgnsr.supabase.co/storage/v1/object/public/public-assets/logo.png" 
            alt="Getaway" 
            style={{ height: '44px', display: 'block' }} 
          />
          <div className="marca-texto">
            <strong>GETAWAY</strong>
            <small>Car Rentals</small>
          </div>
        </Link>
        
        <nav>
          <NavLink to="/" end className={classe}>
            {cliente ? 'Catálogo' : 'Painel'}
          </NavLink>
          {cliente && (
            <NavLink to="/meus-pedidos" className={classe}>
              Meus pedidos
            </NavLink>
          )}
        </nav>
        
        <div className="menu-usuario">
          {/* Componente SquishSwitch com tamanho reduzido para caber bem no cabeçalho */}
          <SquishSwitch 
            checked={!temaEscuro} 
            onChange={(isLight) => setTemaEscuro(!isLight)} 
            width={80} 
            height={28} 
          />
          
          <span className="menu-ola" style={{ display: 'flex', alignItems: 'center', fontWeight: 500, marginLeft: '1rem' }}>
            Olá, {nomeFormatado}
          </span>
          <button onClick={deslogar}>Sair</button>
        </div>
      </div>
    </header>
  )
}