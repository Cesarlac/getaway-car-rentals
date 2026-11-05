import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { urlFoto } from '../fotos.js'

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [carros, setCarros] = useState([])
  const [editando, setEditando] = useState(null)
  const [novoCarro, setNovoCarro] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    try {
      const [p, c] = await Promise.all([api('/api/pedidos/meus'), api('/api/automoveis')])
      setPedidos(p)
      setCarros(c)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function cancelar(id) {
    if (!window.confirm('Cancelar este pedido?')) return
    setErro('')
    try {
      await api(`/api/pedidos/${id}/cancelar`, { method: 'PUT' })
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  async function salvarModificacao(id) {
    setErro('')
    try {
      await api(`/api/pedidos/${id}`, { method: 'PUT', body: { automovelId: novoCarro } })
      setEditando(null)
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (carregando) return <p className="pagina">Carregando...</p>

  return (
    <section className="pagina">
      <h2>Meus pedidos</h2>
      {erro && <p className="erro">{erro}</p>}
      {pedidos.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}

      {pedidos.map((p) => (
        <article key={p.id} className="pedido">
          <img src={urlFoto(p.automovel.matricula, 'frente')} alt={p.automovel.modelo} />
          <div className="pedido-info">
            <strong>{p.automovel.marca} {p.automovel.modelo}</strong>
            <small>{new Date(p.dataCriacao).toLocaleString('pt-BR')}</small>
            <span className={`status ${p.statusFinanceiro}`}>{p.statusFinanceiro}</span>

            {p.statusFinanceiro === 'Pendente' && editando !== p.id && (
              <div className="acoes">
                <button className="secundario" onClick={() => { setEditando(p.id); setNovoCarro(p.automovel.id) }}>
                  Trocar carro
                </button>
                <button className="perigo" onClick={() => cancelar(p.id)}>Cancelar</button>
              </div>
            )}

            {editando === p.id && (
              <div className="acoes">
                <select value={novoCarro} onChange={(e) => setNovoCarro(e.target.value)}>
                  {carros.map((c) => (
                    <option key={c.id} value={c.id}>{c.marca} {c.modelo}</option>
                  ))}
                </select>
                <button onClick={() => salvarModificacao(p.id)}>Salvar</button>
                <button className="secundario" onClick={() => setEditando(null)}>Voltar</button>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  )
}