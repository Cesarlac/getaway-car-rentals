import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { urlFoto } from '../fotos.js'

const FILTROS = ['Todos', 'Pendente', 'Aprovado', 'Reprovado', 'Cancelado']

const moeda = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Painel() {
  const [pedidos, setPedidos] = useState([])
  const [filtro, setFiltro] = useState('Pendente')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(null)

  async function carregar() {
    try {
      setPedidos(await api('/api/pedidos'))
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function avaliar(id, status) {
    setErro('')
    setProcessando(id)
    try {
      await api(`/api/pedidos/${id}/avaliacao`, { method: 'PUT', body: { status } })
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setProcessando(null)
    }
  }

  const visiveis = filtro === 'Todos' ? pedidos : pedidos.filter((p) => p.statusFinanceiro === filtro)
  const contar = (s) => pedidos.filter((p) => p.statusFinanceiro === s).length

  if (carregando) return <p className="pagina">Carregando...</p>

  return (
    <section className="pagina">
      <h2>Painel de avaliação</h2>
      <div className="filtros">
        {FILTROS.map((f) => (
          <button key={f} className={f === filtro ? '' : 'secundario'} onClick={() => setFiltro(f)}>
            {f} {f !== 'Todos' && `(${contar(f)})`}
          </button>
        ))}
      </div>

      {erro && <p className="erro">{erro}</p>}
      {visiveis.length === 0 && <p>Nenhum pedido neste filtro.</p>}

      {visiveis.map((p) => {
        const rendimentos = p.cliente?.empregadoresRendimentos ?? []
        const total = rendimentos.reduce((soma, r) => soma + Number(r.valor || 0), 0)
        return (
          <article key={p.id} className="pedido">
            <img src={urlFoto(p.automovel.matricula, 'frente')} alt={p.automovel.modelo} />
            <div className="pedido-info">
              <strong>{p.automovel.marca} {p.automovel.modelo}</strong>
              <small>
                {p.automovel.ano} · Placa {p.automovel.placa} · {new Date(p.dataCriacao).toLocaleString('pt-BR')}
              </small>
              <span className={`status ${p.statusFinanceiro}`}>{p.statusFinanceiro}</span>

              <div className="cliente-box">
                <strong>{p.cliente.nome}</strong>
                <small>CPF {p.cliente.cpf} · RG {p.cliente.rg} · {p.cliente.profissao}</small>
                <small>{p.cliente.endereco}</small>
                <ul>
                  {rendimentos.map((r, i) => (
                    <li key={i}>{r.empregador}: {moeda(r.valor)}</li>
                  ))}
                </ul>
                <strong>Renda total: {moeda(total)}</strong>
              </div>

              {p.statusFinanceiro === 'Pendente' && (
                <div className="acoes">
                  <button disabled={processando === p.id} onClick={() => avaliar(p.id, 'Aprovado')}>
                    Aprovar
                  </button>
                  <button className="perigo" disabled={processando === p.id} onClick={() => avaliar(p.id, 'Reprovado')}>
                    Reprovar
                  </button>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}