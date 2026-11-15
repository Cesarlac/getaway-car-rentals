import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth/AuthContext.js'
import BotaoPrimario from '../components/BotaoPrimario.jsx'
import TelaAuth from '../components/TelaAuth.jsx'

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
    <TelaAuth titulo="Faça o seu login">
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
          <BotaoPrimario type="submit" disabled={carregando} style={{ width: '100%' }}>
            {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </BotaoPrimario>
        </form>
        <p className="rodape-cartao">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
    </TelaAuth>
  )
}
