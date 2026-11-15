import SpecularButton from './SpecularButton.jsx'

// Botão da ação principal: azul da marca com brilho, igual em todas as telas.
export default function BotaoPrimario({ children, onClick, disabled = false, type = 'button', style }) {
  return (
    <SpecularButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      size="md"
      tint="#0159fd"
      lineColor="#ffffff"
      textColor="#ffffff"
      tintOpacity={1}
      style={style}
    >
      {children}
    </SpecularButton>
  )
}
