// Diária = 0,3% do valor do veículo (o servidor recalcula ao salvar o pedido).
export const TAXA_DIARIA = 0.003

export const moeda = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const diaria = (carro) => Number(carro?.valor || 0) * TAXA_DIARIA

// Ficha técnica: só entram os campos preenchidos.
export function ficha(c) {
  const itens = [
    ['Ano', c.ano],
    ['Motor', c.motor],
    ['Potência', c.cv ? `${c.cv} cv` : null],
    ['Torque', c.torque],
    ['Transmissão', c.transmissao],
    ['Tração', c.tracao],
    ['0 a 100 km/h', c.aceleracao],
    ['Velocidade máxima', c.velocidadeMaxima],
  ]
  return itens.filter(([, v]) => v).map(([rotulo, valor]) => ({ rotulo, valor }))
}

// "5,6 s" -> 5.6 ; sem valor -> Infinity (vai para o fim da ordenação)
export const numero = (texto) => {
  const n = parseFloat(String(texto ?? '').replace(',', '.'))
  return Number.isNaN(n) ? Infinity : n
}

// ----- datas (formato ISO yyyy-mm-dd, o mesmo do <input type="date"> e da API) -----
const dois = (n) => String(n).padStart(2, '0')
const paraISO = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
const dataLocal = (iso) => new Date(`${iso}T00:00:00`)

export const hoje = () => paraISO(new Date())

export function somarDias(iso, n) {
  const d = dataLocal(iso)
  d.setDate(d.getDate() + n)
  return paraISO(d)
}

export function contarDias(inicio, fim) {
  if (!inicio || !fim) return 0
  return Math.round((dataLocal(fim) - dataLocal(inicio)) / 86400000)
}

export const formatarData = (iso) => (iso ? dataLocal(iso).toLocaleDateString('pt-BR') : '—')

// Agrupa a lista de contratos de crédito da API por pedido: { [pedidoId]: [contratos] }.
export function porPedido(contratos) {
  const mapa = {}
  for (const c of contratos) (mapa[c.pedido.id] ??= []).push(c)
  return mapa
}
