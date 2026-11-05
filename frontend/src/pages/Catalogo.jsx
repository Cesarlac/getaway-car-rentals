import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { urlFoto } from '../fotos.js'

export default function Catalogo() {
  const [carros, setCarros] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api('/api/automoveis')
      .then(setCarros)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) return <p className="pagina">Carregando...</p>
  if (erro) return <p className="pagina erro">{erro}</p>

  return (
    <section className="pagina">
      <h2>Catálogo</h2>
      <div className="grade">
        {carros.map((c) => (
          <Link key={c.id} to={`/carros/${c.id}`} className="card">
            <img src={urlFoto(c.matricula, 'frente')} alt={`${c.marca} ${c.modelo}`} loading="lazy" />
            <div className="card-info">
              <strong>{c.marca}</strong>
              <span>{c.modelo}</span>
              <small>{c.ano}</small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}