import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { urlFoto } from '../fotos.js'
import { diaria, moeda } from '../utils.js'
import GradientWaves from './GradientWaves.jsx'
import NomeModelo from './NomeModelo.jsx'
import BotaoAlugar from './BotaoAlugar.jsx'

export default function Carrossel({ carros }) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    if (pausado || carros.length < 2) return undefined
    const t = setInterval(() => setIndice((i) => (i + 1) % carros.length), 6000)
    return () => clearInterval(t)
  }, [pausado, carros.length])

  if (carros.length === 0) return null

  const atual = indice % carros.length
  const c = carros[atual]
  const anterior = () => setIndice((atual - 1 + carros.length) % carros.length)
  const proximo = () => setIndice((atual + 1) % carros.length)

  return (
    <section
      className="hero"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-label="Carros em destaque"
    >
      {/* Fundo animado fixo: não corta ao rolar. dpr=1 poupa a placa de vídeo. */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.6, pointerEvents: 'none' }}>
        <GradientWaves
          horizonColor="#0159fd"
          waveColor="#0044cf"
          crestColor="#e8f0ff"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.8}
          dpr={1}
        />
      </div>

      <div className="hero-int">
        <div className="hero-texto" key={`t-${c.id}`}>
          <span className="marca-nome">{c.marca}</span>
          <h2><NomeModelo>{c.modelo}</NomeModelo></h2>
          <dl className="dados">
            <div><dt>Ano</dt><dd>{c.ano}</dd></div>
            {c.motor && <div><dt>Motor</dt><dd>{c.motor}</dd></div>}
            {c.cv && <div><dt>Potência</dt><dd>{c.cv} cv</dd></div>}
          </dl>
          <p className="hero-preco">
            <strong>{moeda(diaria(c))}</strong> / dia
          </p>

          <div className="hero-acoes">
            <BotaoAlugar carroId={c.id} />
            <Link
              className="btn btn-contorno"
              to={`/carros/${c.id}`}
              style={{ borderRadius: '18px', clipPath: 'none' }}
            >
              Ver veículo
            </Link>
          </div>
        </div>

        <img
          key={`i-${c.id}`}
          className="hero-img"
          src={urlFoto(c.matricula, 'frente-lateral')}
          alt={`${c.marca} ${c.modelo}`}
        />
      </div>

      {carros.length > 1 && (
        <div className="hero-ctrl">
          <button className="seta" onClick={anterior} aria-label="Carro anterior">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div className="pontos">
            {carros.map((x, i) => (
              <button
                key={x.id}
                className={i === atual ? 'ativo' : ''}
                onClick={() => setIndice(i)}
                aria-label={`Ver ${x.marca} ${x.modelo}`}
              />
            ))}
          </div>
          <button className="seta" onClick={proximo} aria-label="Próximo carro">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </section>
  )
}
