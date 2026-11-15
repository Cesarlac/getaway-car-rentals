import GradientWaves from './GradientWaves.jsx'
import Marca from './Marca.jsx'

// Vídeo de fundo opcional (ex.: arquivo no Supabase Storage). Sem a variável,
// o cartão usa as ondas animadas do site.
const VIDEO = import.meta.env.VITE_VIDEO_LOGIN_URL
const POSTER = import.meta.env.VITE_VIDEO_LOGIN_POSTER

// Layout das telas de login e cadastro: o fundo animado ocupa a página inteira
// e o formulário em um painel translúcido à direita. Sempre em tema escuro.
export default function TelaAuth({ titulo, largo = false, children }) {
  return (
    <main className="auth">
      <div className={`auth-card${largo ? ' largo' : ''}`}>
        {VIDEO ? (
          <video
            className="auth-fundo"
            src={VIDEO}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          <div className="auth-fundo" aria-hidden="true">
            <GradientWaves
              horizonColor="#0159fd"
              waveColor="#001a66"
              crestColor="#7fa9ff"
              speed={0.4}
              amplitude={2.5}
              waveScale={0.8}
              dpr={1}
            />
          </div>
        )}

        <div className="auth-lado">
          <Marca />
        </div>

        <section className="auth-painel">
          <h1>
            {titulo}
            <span className="auth-ponto" aria-hidden="true" />
          </h1>
          {children}
        </section>
      </div>
    </main>
  )
}
