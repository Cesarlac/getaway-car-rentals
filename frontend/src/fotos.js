const BASE = import.meta.env.VITE_FOTOS_URL

export const POSES = [
  { id: 'frente', rotulo: 'Frente' },
  { id: 'frente-lateral', rotulo: 'Frente e lateral' },
  { id: 'lateral', rotulo: 'Lateral' },
  { id: 'traseira-lateral', rotulo: 'Traseira e lateral' },
  { id: 'traseira', rotulo: 'Traseira' },
]

// A foto principal de cada carro é a de frente e lateral.
export function urlFoto(matricula, pose = 'frente-lateral') {
  return `${BASE}/${matricula}/${pose}.png`
}
