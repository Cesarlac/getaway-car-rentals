export const ehCliente = (sessao) => sessao?.perfil?.toUpperCase() === 'CLIENTE'
export const ehAgente = (sessao) => sessao?.perfil?.toUpperCase() === 'AGENTE'