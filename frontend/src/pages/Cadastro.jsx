import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function Cadastro() {
  const [perfil, setPerfil] = useState('Cliente')
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [cliente, setCliente] = useState({ cpf: '', rg: '', nome: '', endereco: '', profissao: '' })
  const [rendimentos, setRendimentos] = useState([{ empregador: '', valor: '' }])
  const [agente, setAgente] = useState({ nome: '', tipo: 'Banco' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navegar = useNavigate()

  const campoCliente = (campo) => (e) => setCliente({ ...cliente, [campo]: e.target.value })

  function mudarRendimento(i, campo, valor) {
    setRendimentos(rendimentos.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)))
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const corpo = { login, senha, perfil }
    if (perfil === 'Cliente') {
      corpo.cliente = {
        ...cliente,
        empregadoresRendimentos: rendimentos
          .filter((r) => r.empregador.trim() !== '')
          .map((r) => ({ empregador: r.empregador, valor: Number(r.valor) || 0 })),
      }
    } else {
      corpo.agente = agente
    }

    try {
      await api('/api/auth/registrar', { method: 'POST', body: corpo })
      navegar('/login')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="cartao">
      <h1>Getaway Car Rentals</h1>
      <h2>Cadastro</h2>
      <form onSubmit={enviar}>
        <label>
          Tipo de conta
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="Cliente">Cliente</option>
            <option value="Agente">Agente (banco ou empresa)</option>
          </select>
        </label>

        <label>
          Usuário
          <input value={login} onChange={(e) => setLogin(e.target.value)} required />
        </label>
        <label>
          Senha (mínimo 6 caracteres)
          <input type="password" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>

        {perfil === 'Cliente' ? (
          <>
            <label>Nome<input value={cliente.nome} onChange={campoCliente('nome')} required /></label>
            <label>CPF<input value={cliente.cpf} onChange={campoCliente('cpf')} required /></label>
            <label>RG<input value={cliente.rg} onChange={campoCliente('rg')} required /></label>
            <label>Endereço<input value={cliente.endereco} onChange={campoCliente('endereco')} required /></label>
            <label>Profissão<input value={cliente.profissao} onChange={campoCliente('profissao')} required /></label>

            <fieldset>
              <legend>Empregadores e rendimentos (máximo 3)</legend>
              {rendimentos.map((r, i) => (
                <div className="linha" key={i}>
                  <input
                    placeholder="Empregador"
                    value={r.empregador}
                    onChange={(e) => mudarRendimento(i, 'empregador', e.target.value)}
                  />
                  <input
                    placeholder="Rendimento (R$)"
                    type="number"
                    min="0"
                    value={r.valor}
                    onChange={(e) => mudarRendimento(i, 'valor', e.target.value)}
                  />
                  {rendimentos.length > 1 && (
                    <button type="button" onClick={() => setRendimentos(rendimentos.filter((_, idx) => idx !== i))}>
                      Remover
                    </button>
                  )}
                </div>
              ))}
              {rendimentos.length < 3 && (
                <button type="button" onClick={() => setRendimentos([...rendimentos, { empregador: '', valor: '' }])}>
                  Adicionar empregador
                </button>
              )}
            </fieldset>
          </>
        ) : (
          <>
            <label>
              Nome da instituição
              <input value={agente.nome} onChange={(e) => setAgente({ ...agente, nome: e.target.value })} required />
            </label>
            <label>
              Tipo
              <select value={agente.tipo} onChange={(e) => setAgente({ ...agente, tipo: e.target.value })}>
                <option value="Banco">Banco</option>
                <option value="Empresa">Empresa</option>
              </select>
            </label>
          </>
        )}

        {erro && <p className="erro">{erro}</p>}
        <button disabled={carregando}>{carregando ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </main>
  )
}