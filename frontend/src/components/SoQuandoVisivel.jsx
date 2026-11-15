import { useEffect, useRef, useState } from 'react'

// Só monta o conteúdo quando ele está (quase) na tela.
// Motivo: cada SpecularButton abre um contexto WebGL e o Chrome permite cerca de 16
// por página. Com 15 cards + carrossel + ondas, o limite estourava e o navegador
// derrubava o contexto mais antigo (as ondas do fundo).
export default function SoQuandoVisivel({ children, minHeight = 48 }) {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const obs = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ minHeight, display: 'flex', width: '100%' }}>
      {visivel ? children : null}
    </div>
  )
}
