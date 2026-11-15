import { useState } from 'react'
import { Link } from 'react-router-dom'
import { urlFoto } from '../fotos.js'
import { diaria, ficha, moeda } from '../utils.js'
import { useTemaEscuro } from '../useTemaEscuro.js'
import BorderGlow from './BorderGlow.jsx'
import NomeModelo from './NomeModelo.jsx'
import BotaoAlugar from './BotaoAlugar.jsx'
import SoQuandoVisivel from './SoQuandoVisivel.jsx'

const DETALHES_VERSO = ['Ano', 'Torque', '0 a 100 km/h', 'Velocidade máxima']

export default function CardCarro({ carro: c }) {
  const [aberto, setAberto] = useState(false)
  const isDark = useTemaEscuro()

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor={isDark ? '210 100% 60%' : '220 80% 40%'}
      backgroundColor={isDark ? '#111827' : '#ffffff'}
      borderRadius={10}
      glowRadius={40}
      glowIntensity={1.2}
      className="card-3d-wrapper"
    >
      <div className={`card-3d-inner ${aberto ? 'virado' : ''}`}>

        {/* FRENTE */}
        <article className="card-frente" style={{ border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
          <Link to={`/carros/${c.id}`} className="card-foto">
            <img
              src={urlFoto(c.matricula, 'frente-lateral')}
              alt={`${c.marca} ${c.modelo}`}
              loading="lazy"
            />
          </Link>
          <div className="card-corpo" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span className="marca-nome">{c.marca}</span>
            <h3><NomeModelo>{c.modelo}</NomeModelo></h3>
            {/* Motor à esquerda e diária à direita, na mesma linha */}
            <div className="card-linha">
              <p className="sub">
                {[c.motor, c.cv ? `${c.cv} cv` : null].filter(Boolean).join(' · ') || c.ano}
              </p>
              <p className="preco-linha">
                <strong>{moeda(diaria(c))}</strong> / dia
              </p>
            </div>

            {/* Empurra os botões para a base: todos os cards ficam alinhados */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '0.6rem' }}>
              <div className="card-acoes">
                <SoQuandoVisivel>
                  <BotaoAlugar carroId={c.id} style={{ width: '100%' }} />
                </SoQuandoVisivel>

                <Link className="btn btn-contorno" to={`/carros/${c.id}`} style={{ borderRadius: '18px', clipPath: 'none' }}>
                  Ver veículo
                </Link>
              </div>

              <button type="button" className="link-btn" onClick={() => setAberto(true)}>
                Mostrar detalhes
              </button>
            </div>
          </div>
        </article>

        {/* VERSO */}
        <article className="card-verso" style={{ border: 'none', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
          <div className="card-foto" style={{ flexShrink: 0 }}>
            <img
              src={urlFoto(c.matricula, 'traseira-lateral')}
              alt={`${c.marca} ${c.modelo}`}
              loading="lazy"
            />
          </div>
          <div className="card-corpo" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span className="marca-nome">{c.marca}</span>
            <h3><NomeModelo>{c.modelo}</NomeModelo></h3>

            <div className="chips" style={{ marginTop: '0.5rem' }}>
              {ficha(c)
                .filter((i) => DETALHES_VERSO.includes(i.rotulo))
                .map((i) => (
                  <div className="chip" key={i.rotulo}>
                    <small>{i.rotulo}</small>
                    <strong>{i.valor}</strong>
                  </div>
                ))}
            </div>

            <button type="button" className="link-btn" style={{ marginTop: 'auto' }} onClick={() => setAberto(false)}>
              Esconder detalhes
            </button>
          </div>
        </article>

      </div>
    </BorderGlow>
  )
}
