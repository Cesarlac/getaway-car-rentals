import { useMemo, useState } from 'react'
import { useCarros } from '../useCarros.js'
import { diaria, numero } from '../utils.js'
import Carrossel from '../components/Carrossel.jsx'
import CardCarro from '../components/CardCarro.jsx'

const FAIXAS = [
  { id: '', rotulo: 'Qualquer diária' },
  { id: 'a', rotulo: 'Até R$ 2.000', min: 0, max: 2000 },
  { id: 'b', rotulo: 'R$ 2.000 a R$ 5.000', min: 2000, max: 5000 },
  { id: 'c', rotulo: 'R$ 5.000 a R$ 8.000', min: 5000, max: 8000 },
  { id: 'd', rotulo: 'Acima de R$ 8.000', min: 8000, max: Infinity },
]

const ORDENS = [
  { id: 'padrao', rotulo: 'Padrão' },
  { id: 'nome', rotulo: 'Nome (A a Z)' },
  { id: 'menor', rotulo: 'Menor diária' },
  { id: 'maior', rotulo: 'Maior diária' },
  { id: 'potencia', rotulo: 'Maior potência' },
  { id: 'rapido', rotulo: 'Mais rápido (0 a 100)' },
]

const unicos = (lista, campo) => [...new Set(lista.map((c) => c[campo]).filter(Boolean))].sort()

export default function Catalogo() {
  const { carros, erro, carregando } = useCarros()
  const [busca, setBusca] = useState('')
  const [marca, setMarca] = useState('')
  const [tracao, setTracao] = useState('')
  const [faixa, setFaixa] = useState('')
  const [ordem, setOrdem] = useState('padrao')

  const marcas = useMemo(() => unicos(carros, 'marca'), [carros])
  const tracoes = useMemo(() => unicos(carros, 'tracao'), [carros])

  const destaques = useMemo(() => {
    const marcados = carros.filter((c) => c.destaque)
    return marcados.length > 0 ? marcados : carros.slice(0, 5)
  }, [carros])

  const lista = useMemo(() => {
    const f = FAIXAS.find((x) => x.id === faixa)
    const termo = busca.trim().toLowerCase()
    const filtrados = carros.filter((c) => {
      if (termo && !`${c.marca} ${c.modelo} ${c.motor ?? ''}`.toLowerCase().includes(termo)) return false
      if (marca && c.marca !== marca) return false
      if (tracao && c.tracao !== tracao) return false
      if (f && f.id) {
        const d = diaria(c)
        if (d < f.min || d > f.max) return false
      }
      return true
    })
    const por = {
      nome: (a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`),
      menor: (a, b) => diaria(a) - diaria(b),
      maior: (a, b) => diaria(b) - diaria(a),
      potencia: (a, b) => (b.cv ?? 0) - (a.cv ?? 0),
      rapido: (a, b) => numero(a.aceleracao) - numero(b.aceleracao),
    }
    return por[ordem] ? [...filtrados].sort(por[ordem]) : filtrados
  }, [carros, busca, marca, tracao, faixa, ordem])

  function limpar() {
    setBusca('')
    setMarca('')
    setTracao('')
    setFaixa('')
    setOrdem('padrao')
  }

  if (carregando) return <p className="pagina">Carregando...</p>
  if (erro) return <p className="pagina erro">{erro}</p>

  return (
    <>
      <Carrossel carros={destaques} />

      <section className="pagina" id="frota">
        <div className="cab-secao">
          <h2>Nossa frota</h2>
          <span>{lista.length} {lista.length === 1 ? 'veículo' : 'veículos'}</span>
        </div>

        <div className="filtros-barra">
          <label>
            Buscar
            <input placeholder="Marca, modelo ou motor" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <label>
            Marca
            <select value={marca} onChange={(e) => setMarca(e.target.value)}>
              <option value="">Todas</option>
              {marcas.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>
            Tração
            <select value={tracao} onChange={(e) => setTracao(e.target.value)}>
              <option value="">Todas</option>
              {tracoes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Diária
            <select value={faixa} onChange={(e) => setFaixa(e.target.value)}>
              {FAIXAS.map((x) => <option key={x.id} value={x.id}>{x.rotulo}</option>)}
            </select>
          </label>
          <label>
            Ordenar por
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              {ORDENS.map((x) => <option key={x.id} value={x.id}>{x.rotulo}</option>)}
            </select>
          </label>
          <button type="button" className="secundario" onClick={limpar}>Limpar filtros</button>
        </div>

        {lista.length === 0 ? (
          <p className="vazio">Nenhum veículo encontrado com esses filtros.</p>
        ) : (
          <div className="grade-carros">
            {lista.map((c) => <CardCarro key={c.id} carro={c} />)}
          </div>
        )}
      </section>
    </>
  )
}
