import { useTemaEscuro } from '../useTemaEscuro.js'
import BorderGlow from './BorderGlow.jsx'

// Card de pedido com o mesmo brilho de borda dos cards do catálogo.
// Colunas: foto do carro | dados (children) | coluna da direita, com um bloco
// opcional (lateral, ex.: dados do cliente) em cima e as ações embaixo.
export default function CardPedido({ foto, alt, acoes, lateral, children }) {
  const isDark = useTemaEscuro()

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor={isDark ? '210 100% 60%' : '220 80% 40%'}
      backgroundColor={isDark ? '#111827' : '#ffffff'}
      borderRadius={10}
      glowRadius={40}
      glowIntensity={1.2}
      className="pedido-glow"
    >
      <article className="pedido">
        <img src={foto} alt={alt} />
        <div className="pedido-info">{children}</div>
        {(lateral || acoes) && (
          <div className={`pedido-lado${lateral ? ' largo' : ''}`}>
            {lateral}
            {acoes && <div className="pedido-acoes">{acoes}</div>}
          </div>
        )}
      </article>
    </BorderGlow>
  )
}
