// Nome do modelo sem quebra de linha no meio de palavras com hífen
// (ex.: "E-Performance" nunca vira "E-" numa linha e "Performance" na outra).
export default function NomeModelo({ children }) {
  const palavras = String(children ?? '').split(' ')
  return palavras.map((palavra, i) => (
    <span key={i}>
      {i > 0 && ' '}
      {palavra.includes('-') ? <span className="sem-quebra">{palavra}</span> : palavra}
    </span>
  ))
}
