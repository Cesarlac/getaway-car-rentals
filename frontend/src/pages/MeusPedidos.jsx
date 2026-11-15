import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { urlFoto } from '../fotos.js'
import { contarDias, diaria, formatarData, hoje, moeda, porPedido, somarDias } from '../utils.js'
import BotaoDeslizar from '../components/BotaoDeslizar.jsx'
import BotaoPrimario from '../components/BotaoPrimario.jsx'
import CardPedido from '../components/CardPedido.jsx'
import Creditos from '../components/Creditos.jsx'

const buscar = () =>
  Promise.all([api('/api/pedidos/meus'), api('/api/automoveis'), api('/api/contratos/meus')])

// Prévia do novo total enquanto o cliente altera o carro ou as datas.
// O valor definitivo é recalculado pelo servidor ao salvar.
function PreviaValor({ carros, form, valorAtual }) {
  const carro = carros.find((c) => c.id === form.automovelId)
  const dias = contarDias(form.dataInicio, form.dataFim)

  if (!carro || dias < 1) {
    return <p className="previa-valor erro">A devolução deve ser posterior à retirada.</p>
  }

  const novo = diaria(carro) * dias
  return (
    <div className="previa-valor">
      <div className="previa-total">
        <span>Novo total</span>
        <strong>{moeda(novo)}</strong>
      </div>
      <div className="previa-detalhe">
        {dias} {dias === 1 ? 'dia' : 'dias'} × {moeda(diaria(carro))} por dia
        {valorAtual != null && <> · valor atual {moeda(valorAtual)}</>}
      </div>
    </div>
  )
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carros, setCarros] = useState([])
  const [contratos, setContratos] = useState({})
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ automovelId: '', dataInicio: '', dataFim: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  function aplicar([p, c, k]) {
    setPedidos(p)
    setCarros(c)
    setContratos(porPedido(k))
  }

  const recarregar = () => buscar().then(aplicar).catch((e) => setErro(e.message))

  useEffect(() => {
    buscar()
      .then(aplicar)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  function iniciarEdicao(p) {
    setErro('')
    setEditando(p.id)
    setForm({
      automovelId: p.automovel.id,
      dataInicio: p.dataInicio || hoje(),
      dataFim: p.dataFim || somarDias(hoje(), 7),
    })
  }

  async function salvar(id) {
    setErro('')
    try {
      await api(`/api/pedidos/${id}`, { method: 'PUT', body: form })
      setEditando(null)
      await recarregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (carregando) return <p className="pagina">Carregando...</p>

  return (
    <section className="pagina">
      <h2 className="titulo-secao">Meus pedidos</h2>
      {erro && <p className="erro">{erro}</p>}
      {pedidos.length === 0 && (
        <p className="vazio">
          Você ainda não fez nenhum pedido. <Link to="/">Ver catálogo</Link>
        </p>
      )}

      {pedidos.map((p) => {
        const pendente = p.statusFinanceiro === 'Pendente'
        const emEdicao = editando === p.id

        const acoes = pendente && !emEdicao && (
          <>
            <button className="secundario" onClick={() => iniciarEdicao(p)}>Alterar pedido</button>
            {/* Deslizar já é a confirmação: não precisa de caixa de diálogo. */}
            <BotaoDeslizar
              tipo="cancelar"
              onConfirm={() => {
                setErro('')
                return api(`/api/pedidos/${p.id}/cancelar`, { method: 'PUT' })
              }}
              onDone={() => setTimeout(recarregar, 900)}
              onError={(e) => setErro(e?.message || 'Não foi possível cancelar o pedido.')}
            />
          </>
        )

        return (
          <CardPedido
            key={p.id}
            foto={urlFoto(p.automovel.matricula, 'frente-lateral')}
            alt={`${p.automovel.marca} ${p.automovel.modelo}`}
            acoes={acoes}
          >
            <span className="marca-nome">{p.automovel.marca}</span>
            <strong className="pedido-titulo">{p.automovel.modelo}</strong>
            <span className={`status ${p.statusFinanceiro}`}>{p.statusFinanceiro}</span>

            {p.dataInicio ? (
              <p className="pedido-linha">
                {formatarData(p.dataInicio)} a {formatarData(p.dataFim)} · {contarDias(p.dataInicio, p.dataFim)} dias
                · Total <strong>{moeda(p.valorTotal)}</strong>
              </p>
            ) : (
              <p className="pedido-linha">Período não informado</p>
            )}
            <p className="pedido-linha suave">Pedido feito em {new Date(p.dataCriacao).toLocaleString('pt-BR')}</p>

            <Creditos creditos={contratos[p.id]} status={p.statusFinanceiro} />

            {emEdicao && (
              <div className="edicao">
                <label>
                  Carro
                  <select value={form.automovelId} onChange={(e) => setForm({ ...form, automovelId: e.target.value })}>
                    {carros.map((c) => (
                      <option key={c.id} value={c.id}>{c.marca} {c.modelo}</option>
                    ))}
                  </select>
                </label>
                <div className="campos-datas">
                  <label>
                    Retirada
                    <input type="date" min={hoje()} value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
                  </label>
                  <label>
                    Devolução
                    <input type="date" min={form.dataInicio} value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
                  </label>
                </div>
                <PreviaValor carros={carros} form={form} valorAtual={p.valorTotal} />
                {(contratos[p.id]?.length ?? 0) > 0 && (
                  <p className="nota">Ao salvar, os créditos já concedidos a este pedido deixam de valer.</p>
                )}
                <div className="acoes">
                  <BotaoPrimario onClick={() => salvar(p.id)}>SALVAR</BotaoPrimario>
                  <button className="secundario" onClick={() => setEditando(null)}>Voltar</button>
                </div>
              </div>
            )}
          </CardPedido>
        )
      })}
    </section>
  )
}
