import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useCarros } from '../useCarros.js'
import { urlFoto } from '../fotos.js'
import { contarDias, diaria, formatarData, hoje, moeda, somarDias } from '../utils.js'
import BotaoPrimario from '../components/BotaoPrimario.jsx'
import NomeModelo from '../components/NomeModelo.jsx'

const ATALHOS = [3, 7, 15, 30]
const MAX_DIAS = 365

export default function Alugar() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { carros, erro: erroCarros, carregando } = useCarros()
  const [inicio, setInicio] = useState(hoje())
  const [fim, setFim] = useState(somarDias(hoje(), 7))
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [diasTexto, setDiasTexto] = useState(null) // texto do campo "Outro" enquanto é digitado

  const carro = carros.find((c) => c.id === id)

  if (carregando) return <p className="pagina">Carregando...</p>
  if (erroCarros || !carro) return <p className="pagina erro">{erroCarros || 'Carro não encontrado'}</p>

  const dias = contarDias(inicio, fim)
  const valida = dias >= 1 && inicio >= hoje()
  const total = diaria(carro) * Math.max(dias, 0)

  function mudarInicio(valor) {
    setInicio(valor)
    if (contarDias(valor, fim) < 1) setFim(somarDias(valor, 1))
  }

  // Quantidade de dias digitada: ajusta a data de devolução.
  function mudarDias(texto) {
    setDiasTexto(texto)
    const n = Math.min(Math.floor(Number(texto)), MAX_DIAS)
    if (n >= 1) setFim(somarDias(inicio, n))
  }

  async function confirmar() {
    setErro('')
    setEnviando(true)
    try {
      await api('/api/pedidos', {
        method: 'POST',
        body: { automovelId: carro.id, dataInicio: inicio, dataFim: fim },
      })
      navegar('/meus-pedidos')
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="pagina">
      <Link to={`/carros/${carro.id}`} className="voltar">← Voltar ao veículo</Link>

      <div className="alugar-grid">
        {/* Esquerda: o carro escolhido */}
        <aside className="painel-card alugar-carro">
          <img src={urlFoto(carro.matricula, 'frente-lateral')} alt={`${carro.marca} ${carro.modelo}`} />
          <span className="marca-nome">{carro.marca}</span>
          <h3><NomeModelo>{carro.modelo}</NomeModelo></h3>
        </aside>

        {/* Direita: período, resumo e confirmação */}
        <div className="alugar-lado">
        <h2 className="titulo-secao">Escolha o período do aluguel</h2>

        <div className="painel-card">
          <div className="campos-datas">
            <label>
              Retirada
              <input type="date" min={hoje()} value={inicio} onChange={(e) => mudarInicio(e.target.value)} />
            </label>
            <label>
              Devolução
              <input type="date" min={somarDias(inicio || hoje(), 1)} value={fim} onChange={(e) => setFim(e.target.value)} />
            </label>
          </div>

          <p className="atalhos-titulo">Períodos rápidos</p>
          <div className="atalhos">
            {ATALHOS.map((n) => (
              <button
                key={n}
                type="button"
                className={dias === n ? 'chip-btn ativo' : 'chip-btn'}
                onClick={() => setFim(somarDias(inicio, n))}
              >
                {n} dias
              </button>
            ))}
            <label className="atalho-livre">
              <span>Outro:</span>
              <input
                type="number"
                min="1"
                max={MAX_DIAS}
                step="1"
                inputMode="numeric"
                aria-label="Quantidade de dias"
                value={diasTexto ?? (dias >= 1 ? dias : '')}
                onChange={(e) => mudarDias(e.target.value)}
                onBlur={() => setDiasTexto(null)}
              />
              <span>dias</span>
            </label>
          </div>

          {!valida && <p className="erro">A devolução deve ser posterior à retirada, e a retirada não pode ser no passado.</p>}
          {erro && <p className="erro">{erro}</p>}
        </div>

        <div className="resumo">
          <dl className="resumo-linhas">
            <div><dt>Diária</dt><dd>{moeda(diaria(carro))}</dd></div>
            <div><dt>Retirada</dt><dd>{formatarData(inicio)}</dd></div>
            <div><dt>Devolução</dt><dd>{formatarData(fim)}</dd></div>
            <div><dt>Duração</dt><dd>{dias > 0 ? `${dias} ${dias === 1 ? 'dia' : 'dias'}` : '—'}</dd></div>
          </dl>

          <div className="resumo-total">
            <small>Valor total</small>
            <strong>{valida ? moeda(total) : '—'}</strong>
          </div>

          <BotaoPrimario disabled={!valida || enviando} onClick={confirmar} style={{ width: '100%' }}>
            {enviando ? 'ENVIANDO...' : 'CONFIRMAR SOLICITAÇÃO'}
          </BotaoPrimario>
          <p className="nota">O pedido passa por análise financeira antes da confirmação do contrato.</p>
        </div>
        </div>
      </div>
    </section>
  )
}
