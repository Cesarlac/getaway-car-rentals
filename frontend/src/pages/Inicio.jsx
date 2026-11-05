import { useAuth } from '../auth/AuthContext.js'
import { ehAgente } from '../perfil.js'
import Catalogo from './Catalogo.jsx'
import Painel from './Painel.jsx'

export default function Inicio() {
  const { sessao } = useAuth()
  return ehAgente(sessao) ? <Painel /> : <Catalogo />
}