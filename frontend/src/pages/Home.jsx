import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'

export default function Home() {
  const { sessao, sair } = useAuth()
  const navegar = useNavigate()

  function deslogar() {
    sair()
    navegar('/login')
  }

  return (
    <main className="cartao">
      <h1>Getaway Car Rentals</h1>
      <p>
        Logado como <strong>{sessao.login}</strong> ({sessao.perfil})
      </p>
      <button onClick={deslogar}>Sair</button>
    </main>
  )
}