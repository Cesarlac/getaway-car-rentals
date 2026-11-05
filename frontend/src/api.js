const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export function getSessao() {
  try {
    return JSON.parse(localStorage.getItem('sessao'))
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  localStorage.setItem('sessao', JSON.stringify(sessao))
}

export function limparSessao() {
  localStorage.removeItem('sessao')
}

const MENSAGENS = {
  400: 'Dados inválidos',
  401: 'Login ou senha inválidos',
  403: 'Você não tem permissão para esta ação',
  404: 'Não encontrado',
  409: 'Operação não permitida no estado atual',
}

export async function api(caminho, { method = 'GET', body } = {}) {
  const sessao = getSessao()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (sessao?.token) headers.Authorization = `Bearer ${sessao.token}`

  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor')
  }

  if (resposta.status === 401 && sessao && !caminho.startsWith('/api/auth/')) {
    limparSessao()
    window.location.href = '/login'
    throw new Error('Sessão expirada, faça login novamente')
  }

  if (!resposta.ok) {
    let mensagem
    try {
      mensagem = (await resposta.json()).message
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(mensagem || MENSAGENS[resposta.status] || `Erro ${resposta.status}`)
  }

  const texto = await resposta.text()
  return texto ? JSON.parse(texto) : null
}