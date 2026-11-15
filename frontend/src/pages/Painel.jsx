import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { urlFoto } from '../fotos.js'
import { contarDias, formatarData, moeda, porPedido } from '../utils.js'
import BotaoDeslizar from '../components/BotaoDeslizar.jsx'
import CardPedido from '../components/CardPedido.jsx'
import Creditos from '../components/Creditos.jsx'

const FILTROS = ['Todos', 'Pendente', 'Aprovado', 'Reprovado', 'Cancelado']

const buscar = () => Promise.all([api('/api/pedidos'), api('/api/contratos'), api('/api/me')])

// Papéis no painel:
//   Banco   -> só concede crédito, em pedidos Pendentes (um crédito por banco em cada pedido).
//   Empresa -> aprova ou reprova. Ao aprovar, escolhe quais créditos concedidos utilizar,
//              ou aprova diretamente, sem crédito.
export default function Painel() {
  const [pedidos, setPedidos] = useState([])
  const [contratos, setContratos] = useState({})
  const [eu, setEu] = useState({ tipoAgente: '', agenteId: '' })
  const [escolhidos, setEscolhidos] = useState({}) // { [pedidoId]: [ids dos créditos marcados] }
  const [filtro, setFiltro] = useState('Pendente')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(null)

  function aplicar([p, c, me]) {
    setPedidos(p)
    setContratos(porPedido(c))
    setEu({ tipoAgente: me.tipoAgente || '', agenteId: me.agenteId || '' })
  }

  useEffect(() => {
    buscar()
      .then(aplicar)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  const ehBanco = eu.tipoAgente === 'Banco'
  const ehEmpresa = eu.tipoAgente === 'Empresa'

  // Props comuns dos botões de deslizar: enquanto uma ação está em andamento,
  // os outros botões ficam travados; depois da animação de sucesso, a lista recarrega.
  function acao(chave, executar) {
    return {
      disabled: processando !== null && processando !== chave,
      onConfirm: () => {
        setErro('')
        setProcessando(chave)
        return executar()
      },
      onDone: () =>
        setTimeout(() => {
          buscar()
            .then(aplicar)
            .catch((e) => setErro(e.message))
            .finally(() => setProcessando(null))
        }, 900),
      onError: (e) => {
        setErro(e?.message || 'Não foi possível concluir a ação.')
        setProcessando(null)
      },
    }
  }

  const avaliar = (id, status) =>
    acao(`${id}:${status}`, () =>
      api(`/api/pedidos/${id}/avaliacao`, {
        method: 'PUT',
        body: { status, creditosIds: status === 'Aprovado' ? (escolhidos[id] ?? []) : [] },
      }),
    )

  const conceder = (id) =>
    acao(`${id}:credito`, () => api('/api/contratos', { method: 'POST', body: { pedidoId: id } }))

  function alternarCredito(pedidoId, creditoId) {
    const atuais = escolhidos[pedidoId] ?? []
    const novos = atuais.includes(creditoId) ? atuais.filter((x) => x !== creditoId) : [...atuais, creditoId]
    setEscolhidos({ ...escolhidos, [pedidoId]: novos })
  }

  const visiveis = filtro === 'Todos' ? pedidos : pedidos.filter((p) => p.statusFinanceiro === filtro)
  const contar = (s) => pedidos.filter((p) => p.statusFinanceiro === s).length

  if (carregando) return <p className="pagina">Carregando...</p>

  return (
    <section className="pagina">
      <h2 className="titulo-secao">{ehBanco ? 'Painel de crédito' : 'Painel de avaliação'}</h2>
      <p className="painel-papel">
        {ehBanco && 'Como banco, você concede crédito aos pedidos pendentes. A aprovação do pedido é feita por uma empresa.'}
        {ehEmpresa && 'Como empresa, você aprova ou reprova os pedidos. Ao aprovar, pode utilizar os créditos já concedidos por bancos ou aprovar diretamente.'}
      </p>

      <div className="filtros">
        {FILTROS.map((f) => (
          <button key={f} className={f === filtro ? 'chip-btn ativo' : 'chip-btn'} onClick={() => setFiltro(f)}>
            {f} {f !== 'Todos' && `(${contar(f)})`}
          </button>
        ))}
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!ehBanco && !ehEmpresa && !erro && (
        <p className="erro">Não foi possível identificar se você é banco ou empresa. Reinicie o backend e entre de novo.</p>
      )}
      {visiveis.length === 0 && <p className="vazio">Nenhum pedido neste filtro.</p>}

      {visiveis.map((p) => {
        const rendimentos = p.cliente?.empregadoresRendimentos ?? []
        const total = rendimentos.reduce((soma, r) => soma + Number(r.valor || 0), 0)
        const creditos = contratos[p.id] ?? []
        const pendente = p.statusFinanceiro === 'Pendente'
        const jaConcedi = creditos.some((c) => c.bancoAgente.id === eu.agenteId)
        const marcados = escolhidos[p.id] ?? []

        let acoes = null
        if (pendente && ehEmpresa) {
          acoes = (
            <>
              <BotaoDeslizar tipo="aprovar" {...avaliar(p.id, 'Aprovado')} />
              <BotaoDeslizar tipo="reprovar" {...avaliar(p.id, 'Reprovado')} />
            </>
          )
        } else if (pendente && ehBanco && !jaConcedi) {
          acoes = <BotaoDeslizar tipo="credito" {...conceder(p.id)} />
        }

        // A empresa escolhe, no pedido pendente, quais créditos concedidos vai utilizar.
        const escolhaCreditos = pendente && ehEmpresa && (
          <fieldset className="creditos-escolha">
            <legend>Créditos concedidos por bancos</legend>
            {creditos.length === 0 && <span className="suave">Nenhum banco concedeu crédito a este pedido.</span>}
            {creditos.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={marcados.includes(c.id)}
                  onChange={() => alternarCredito(p.id, c.id)}
                />
                <span>
                  <strong>{c.bancoAgente.nome}</strong>
                  <small> · {new Date(c.dataConcessao).toLocaleDateString('pt-BR')}</small>
                </span>
              </label>
            ))}
            <small className="suave">
              {marcados.length > 0
                ? `Aprovar utilizando ${marcados.length} ${marcados.length === 1 ? 'crédito' : 'créditos'}.`
                : 'Sem marcar nenhum, o pedido é aprovado diretamente.'}
            </small>
          </fieldset>
        )

        const lateral = (
          <>
            <div className="cliente-box">
              <strong>{p.cliente.nome}</strong>
              <span>CPF {p.cliente.cpf} · RG {p.cliente.rg} · {p.cliente.profissao}</span>
              <span>{p.cliente.endereco}</span>
              <ul>
                {rendimentos.map((r, i) => (
                  <li key={i}>{r.empregador}: {moeda(r.valor)}</li>
                ))}
              </ul>
              <strong>Renda total: {moeda(total)}</strong>
            </div>
            {escolhaCreditos}
          </>
        )

        return (
          <CardPedido
            key={p.id}
            foto={urlFoto(p.automovel.matricula, 'frente-lateral')}
            alt={`${p.automovel.marca} ${p.automovel.modelo}`}
            lateral={lateral}
            acoes={acoes}
          >
            <span className="marca-nome">{p.automovel.marca}</span>
            <strong className="pedido-titulo">{p.automovel.modelo}</strong>
            <span className={`status ${p.statusFinanceiro}`}>{p.statusFinanceiro}</span>

            <p className="pedido-linha suave">
              {p.automovel.ano} · Placa {p.automovel.placa} · Pedido de{' '}
              {new Date(p.dataCriacao).toLocaleString('pt-BR')}
            </p>

            {p.dataInicio ? (
              <p className="pedido-linha">
                {formatarData(p.dataInicio)} a {formatarData(p.dataFim)} · {contarDias(p.dataInicio, p.dataFim)} dias
                · Total <strong>{moeda(p.valorTotal)}</strong>
              </p>
            ) : (
              <p className="pedido-linha">Período não informado</p>
            )}

            {/* Para a empresa, os créditos do pedido pendente aparecem como opções na coluna da direita. */}
            {!(pendente && ehEmpresa) && <Creditos creditos={creditos} status={p.statusFinanceiro} />}
            {pendente && ehBanco && jaConcedi && (
              <p className="pedido-linha suave">Você já concedeu crédito a este pedido. Aguardando a avaliação de uma empresa.</p>
            )}
          </CardPedido>
        )
      })}
    </section>
  )
}
