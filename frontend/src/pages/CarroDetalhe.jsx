import { Link, useParams } from 'react-router-dom'
import { useCarros } from '../useCarros.js'
import { POSES, urlFoto } from '../fotos.js'
import { diaria, ficha, moeda } from '../utils.js'
import { useTemaEscuro } from '../useTemaEscuro.js'
import BotaoAlugar from '../components/BotaoAlugar.jsx'
import DepthCarousel from '../components/DepthCarousel.jsx'
import GradientWaves from '../components/GradientWaves.jsx'
import NomeModelo from '../components/NomeModelo.jsx'

export default function CarroDetalhe() {
  const { id } = useParams()
  const { carros, erro, carregando } = useCarros()
  const isDark = useTemaEscuro()

  const carro = carros.find((c) => c.id === id)
  if (carregando) return <p className="pagina">Carregando...</p>
  if (erro || !carro) return <p className="pagina erro">{erro || 'Carro não encontrado'}</p>

  const equipamentos = (carro.equipamentos || '')
    .split('\n')
    .map((e) => e.trim())
    .filter(Boolean)

  // Volta completa no carro: depois da traseira, as fotos de traseira-lateral, lateral
  // e frente-lateral reaparecem espelhadas, como se fossem o outro lado, até voltar à frente.
  const foto = (id, flip = false) => ({
    image: urlFoto(carro.matricula, id),
    alt: POSES.find((p) => p.id === id).rotulo + (flip ? ' (outro lado)' : ''),
    flip,
  })
  const fotos = [
    ...POSES.map((p) => foto(p.id)),
    foto('traseira-lateral', true),
    foto('lateral', true),
    foto('frente-lateral', true),
  ]

  return (
    <>
      <section className="detalhe-hero">
        {/* Mesmo fundo de ondas do catálogo, só nesta seção do topo */}
        <div className="detalhe-ondas">
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
        <div className="detalhe-hero-int">
          <div className="detalhe-texto">
            <Link to="/" className="voltar">← Voltar ao catálogo</Link>
            <span className="marca-nome">{carro.marca}</span>
            <h1><NomeModelo>{carro.modelo}</NomeModelo></h1>

            <dl className="dados">
              <div><dt>Ano</dt><dd>{carro.ano}</dd></div>
              {carro.motor && <div><dt>Motor</dt><dd>{carro.motor}</dd></div>}
              {carro.cv && <div><dt>Potência</dt><dd>{carro.cv} cv</dd></div>}
            </dl>

            <p className="preco-diaria">
              <strong>{moeda(diaria(carro))}</strong> <small>/ dia</small>
            </p>

            <BotaoAlugar carroId={carro.id} style={{ marginTop: '0.8rem' }} />
          </div>
          <img
            className="detalhe-img"
            src={urlFoto(carro.matricula, 'frente')}
            alt={`${carro.marca} ${carro.modelo}, frente`}
          />
        </div>
      </section>

      <section className="pagina">
        <h2 className="titulo-secao">Galeria</h2>
        <div className="galeria-3d">
          <DepthCarousel
            key={carro.id}
            items={fotos}
            cardWidth={990}
            cardHeight={660}
            radius={14}
            tint={isDark ? '#05060a' : '#7c8698'}
            depth={220}
            spread={90}
            tilt={22}
            tiltDirection="right"
            perspective={1400}
            visibleCards={2}
            falloff={0.2}
            blur={6}
            autoplay
            autoplayDelay={3200}
            loop
            showIndicators={false}
          />
        </div>
      </section>

      <section className="ficha-sec">
        <div className="ficha-int">
          <div className="ficha-lista">
            <h2 className="titulo-secao">Detalhes do veículo</h2>
            <ul>
              {ficha(carro).map((i) => (
                <li key={i.rotulo}>
                  <span>{i.rotulo}</span>
                  <strong>{i.valor}</strong>
                </li>
              ))}
            </ul>

            {equipamentos.length > 0 && (
              <>
                <h3>Equipamentos</h3>
                <ul className="equip">
                  {equipamentos.map((e, k) => <li key={k}>{e}</li>)}
                </ul>
              </>
            )}

            <BotaoAlugar carroId={carro.id} />
          </div>
          <img
            className="ficha-img"
            src={urlFoto(carro.matricula, 'traseira')}
            alt={`${carro.marca} ${carro.modelo}, traseira`}
          />
        </div>
      </section>
    </>
  )
}
