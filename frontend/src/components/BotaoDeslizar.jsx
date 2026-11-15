import { useTemaEscuro } from '../useTemaEscuro.js'
import SlideCommit from './SlideCommit.jsx'

// Ações que mudam o pedido de forma definitiva: é preciso deslizar para confirmar.
const TIPOS = {
  aprovar: { label: 'Aprovar', doneLabel: 'Aprovado', claro: '#15803d', escuro: '#22c55e' },
  reprovar: { label: 'Reprovar', doneLabel: 'Reprovado', claro: '#dc2626', escuro: '#ef4444' },
  cancelar: { label: 'Cancelar', doneLabel: 'Cancelado', claro: '#dc2626', escuro: '#ef4444' },
  credito: { label: 'Conceder crédito', doneLabel: 'Concedido', claro: '#0159fd', escuro: '#3b82f6' },
}

export default function BotaoDeslizar({ tipo, onConfirm, onDone, onError, disabled = false }) {
  const isDark = useTemaEscuro()
  const t = TIPOS[tipo]
  const cor = isDark ? t.escuro : t.claro

  return (
    <SlideCommit
      label={t.label}
      doneLabel={t.doneLabel}
      errorLabel="Não foi possível"
      onConfirm={onConfirm}
      onDone={onDone}
      onError={onError}
      disabled={disabled}
      trackColor={isDark ? '#1f2937' : '#e6eaf2'}
      handleColor={cor}
      successColor={cor}
      dangerColor={isDark ? '#f59e0b' : '#b45309'}
      width={240}
      height={48}
      radius={24}
      holdMs={0}
    />
  )
}
