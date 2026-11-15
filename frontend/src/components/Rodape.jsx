import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.js'
import { ehCliente } from '../perfil.js'
import Marca from './Marca.jsx'

export default function Rodape() {
  const { sessao } = useAuth()
  const cliente = ehCliente(sessao)

  return (
    <footer className="rodape">
      <div className="rodape-int">
        <div>
          <Marca />
          <p>
            Aluguel de automóveis esportivos e de luxo, com análise financeira e crédito
            concedido por bancos parceiros.
          </p>
        </div>
        <div>
          <h4>Navegação</h4>
          <ul>
            <li><Link to="/">{cliente ? 'Catálogo' : 'Painel de avaliação'}</Link></li>
            {cliente && <li><Link to="/meus-pedidos">Meus pedidos</Link></li>}
          </ul>
        </div>
        <div>
          <h4>Sobre o projeto</h4>
          <p>
            Projeto acadêmico da disciplina Desenvolvimento e Integração de Aplicações Web,
            Engenharia de Software, PUC Minas.
          </p>
        </div>
      </div>
      <div className="rodape-fim">© {new Date().getFullYear()} Getaway Car Rentals. Todos os direitos reservados.</div>
    </footer>
  )
}
