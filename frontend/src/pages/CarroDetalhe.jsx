import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth/AuthContext.js'
import { POSES, urlFoto } from '../fotos.js'

export default function CarroDetalhe() {
  const { id } = useParams()
  const { sessao } = useAuth()
  const navegar = useNavigate()
  const [carro, setCarro] = useState(null)
  const [pose, setPose] = useState('frente')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const ehCliente = sessao.perfil?.toUpperCase() === 'CLIENTE'

  useEffect(() => {
    api('/api/automoveis')
      .then((lista) => {
        const achado = lista.find((c) => c.id === id)
        if (achado) setCarro(achado)
        else setErro('Carro não encontrado')
      })
      .catch((e) => setErro(e.message))
  }, [id])

  async function pedir() {
    setErro('')
    setEnviando(true)
    try {
      await api('/api/pedidos', { method: 'POST', body: { automovelId: carro.id } })
      navegar('/meus-pedidos')
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!carro) return <p className={erro ? 'pagina erro' : 'pagina'}>{erro || 'Carregando...'}</p>

  return (
    <section className="pagina detalhe">
      <button className="secundario" onClick={() => navegar('/')}>← Voltar</button>
      <h2>{carro.marca} {carro.modelo}</h2>
      <p>Ano: {carro.ano} · Placa: {carro.placa} · Proprietário: {carro.tipoProprietario}</p>

      <img className="foto-grande" src={urlFoto(carro.matricula, pose)} alt={`${carro.marca} ${carro.modelo}`} />
      <div className="miniaturas">
        {POSES.map((p) => (
          <img
            key={p.id}
            src={urlFoto(carro.matricula, p.id)}
            alt={p.rotulo}
            title={p.rotulo}
            className={p.id === pose ? 'ativa' : ''}
            onClick={() => setPose(p.id)}
          />
        ))}
      </div>

      {erro && <p className="erro">{erro}</p>}
      {ehCliente && (
        <button disabled={enviando} onClick={pedir}>
          {enviando ? 'Enviando...' : 'Solicitar aluguel'}
        </button>
      )}
    </section>
  )
}