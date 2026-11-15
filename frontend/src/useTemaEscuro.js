import { useSyncExternalStore } from 'react'

// Observa a classe "dark" do <html>. Qualquer componente que usar este hook
// re-renderiza sozinho quando o botão de tema (Menu) alternar o modo.
function assinar(aoMudar) {
  const obs = new MutationObserver(aoMudar)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

const ler = () => document.documentElement.classList.contains('dark')

export function useTemaEscuro() {
  return useSyncExternalStore(assinar, ler, () => false)
}
