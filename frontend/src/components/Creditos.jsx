// Créditos concedidos por bancos a um pedido.
// Pendente: todos os créditos disponíveis. Aprovado: só os que a empresa utilizou.
export default function Creditos({ creditos = [], status }) {
  const data = (c) => new Date(c.dataConcessao).toLocaleString('pt-BR')

  if (status === 'Pendente') {
    return creditos.map((c) => (
      <div className="contrato-box" key={c.id}>
        💳 Crédito concedido por <strong>{c.bancoAgente.nome}</strong> em {data(c)}
      </div>
    ))
  }

  if (status === 'Aprovado') {
    const usados = creditos.filter((c) => c.utilizado)
    if (usados.length === 0) {
      return <div className="contrato-box neutro">Aprovado diretamente, sem crédito de banco</div>
    }
    return usados.map((c) => (
      <div className="contrato-box" key={c.id}>
        💳 Crédito de <strong>{c.bancoAgente.nome}</strong> utilizado no contrato
      </div>
    ))
  }

  return null
}
