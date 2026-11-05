import { useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { getSessao, salvarSessao, limparSessao } from '../api.js'

export default function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(getSessao)

  const entrar = (dados) => {
    salvarSessao(dados)
    setSessao(dados)
  }

  const sair = () => {
    limparSessao()
    setSessao(null)
  }

  return (
    <AuthContext.Provider value={{ sessao, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}