import { useEffect, useState } from 'react'
import { api } from './api.js'

export function useCarros() {
  const [carros, setCarros] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api('/api/automoveis')
      .then((lista) => setCarros([...lista].sort((a, b) => a.matricula.localeCompare(b.matricula))))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  return { carros, erro, carregando }
}
