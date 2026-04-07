// services/auth.ts
export interface Usuario {
  id: string
  nome: string
  telefone: string
  email: string
  plano: 'gratis' | 'basico' | 'premium'
  status: 'ativo' | 'suspenso'
  dataCadastro: string
  ultimoAcesso: string
  dispositivoId?: string
}

// Verificar se telefone já está cadastrado
export function verificarTelefoneExistente(telefone: string): boolean {
  const usuarios = localStorage.getItem('usuarios')
  if (!usuarios) return false
  
  const lista = JSON.parse(usuarios)
  return lista.some((u: Usuario) => u.telefone === telefone)
}

// Cadastrar novo usuário
export function cadastrarUsuario(nome: string, telefone: string, email: string): Usuario | null {
  // Verificar duplicidade
  if (verificarTelefoneExistente(telefone)) {
    alert('❌ Este telefone já está cadastrado!')
    return null
  }
  
  const novoUsuario: Usuario = {
    id: Date.now().toString(),
    nome,
    telefone,
    email,
    plano: 'gratis',
    status: 'ativo',
    dataCadastro: new Date().toISOString(),
    ultimoAcesso: new Date().toISOString()
  }
  
  const usuarios = localStorage.getItem('usuarios')
  const lista = usuarios ? JSON.parse(usuarios) : []
  lista.push(novoUsuario)
  localStorage.setItem('usuarios', JSON.stringify(lista))
  localStorage.setItem('usuario_logado', JSON.stringify(novoUsuario))
  
  return novoUsuario
}

// Login por telefone
export function loginPorTelefone(telefone: string): Usuario | null {
  const usuarios = localStorage.getItem('usuarios')
  if (!usuarios) return null
  
  const lista = JSON.parse(usuarios)
  const usuario = lista.find((u: Usuario) => u.telefone === telefone)
  
  if (usuario && usuario.status === 'ativo') {
    usuario.ultimoAcesso = new Date().toISOString()
    localStorage.setItem('usuarios', JSON.stringify(lista))
    localStorage.setItem('usuario_logado', JSON.stringify(usuario))
    return usuario
  }
  
  return null
}

// Verificar plano do usuário
export function getPlanoUsuario(): 'gratis' | 'basico' | 'premium' {
  const usuarioLogado = localStorage.getItem('usuario_logado')
  if (!usuarioLogado) return 'gratis'
  
  const usuario = JSON.parse(usuarioLogado)
  return usuario.plano
}

// Verificar permissões baseadas no plano
export function verificarPermissao(recurso: string): boolean {
  const plano = getPlanoUsuario()
  
  const permissoes: Record<string, string[]> = {
    'pdv_completo': ['basico', 'premium'],
    'relatorios_fiado': ['basico', 'premium'],
    'estoque_avancado': ['basico', 'premium'],
    'academia': ['basico', 'premium'],
    'busca_avancada': ['premium'],
    'api_externa': ['premium']
  }
  
  const planosPermitidos = permissoes[recurso] || []
  return planosPermitidos.includes(plano)
}

// Logout
export function logout() {
  localStorage.removeItem('usuario_logado')
}

// Obter usuário logado
export function getUsuarioLogado(): Usuario | null {
  const usuario = localStorage.getItem('usuario_logado')
  return usuario ? JSON.parse(usuario) : null
}