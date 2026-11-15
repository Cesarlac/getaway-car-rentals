import { useNavigate } from 'react-router-dom'
import BotaoPrimario from './BotaoPrimario.jsx'

// Botão padrão de "Solicitar aluguel": o mesmo visual em todas as telas.
export default function BotaoAlugar({ carroId, style }) {
  const navegar = useNavigate()

  return (
    <BotaoPrimario onClick={() => navegar(`/alugar/${carroId}`)} style={style}>
      SOLICITAR ALUGUEL
    </BotaoPrimario>
  )
}
