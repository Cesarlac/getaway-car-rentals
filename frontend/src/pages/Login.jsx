import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth/AuthContext.js'

export default function Login() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { entrar } = useAuth()
  const navegar = useNavigate()

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const r = await api('/api/auth/login', { method: 'POST', body: { login, senha } })
      entrar({ token: r.token, perfil: r.perfil, login })
      navegar('/')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="cartao">
      <h1>Getaway Car Rentals</h1>
      <h2>Entrar</h2>
      <form onSubmit={enviar}>
        <label>
          Usuário
          <input value={login} onChange={(e) => setLogin(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p>
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </main>
  )
}