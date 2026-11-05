const BASE = import.meta.env.VITE_FOTOS_URL

export const POSES = [
  { id: 'frente', rotulo: 'Frente' },
  { id: 'frente-lateral', rotulo: 'Frente e lateral' },
  { id: 'lateral', rotulo: 'Lateral' },
  { id: 'traseira-lateral', rotulo: 'Traseira e lateral' },
  { id: 'traseira', rotulo: 'Traseira' },
]

export function urlFoto(matricula, pose = 'frente') {
  return `${BASE}/${matricula}/${pose}.avif`
}