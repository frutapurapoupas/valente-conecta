// Script para configurar usuário de teste com role "servico_agendamento"
// Execute no console do navegador: node scripts/setup-servico-agendamento.js

const setupServicoAgendamento = () => {
  const userProfile = {
    id: 'servico-test-1',
    nome: 'Barbearia do Zé',
    email: 'barbearia@ze.com',
    telefone: '75999991000',
    role: 'servico_agendamento',
    servicoId: '1',
    createdAt: new Date().toISOString()
  }

  localStorage.setItem('valente_user_profile', JSON.stringify(userProfile))
  console.log('✅ Usuário de serviço com agendamento configurado!')
  console.log('📝 Perfil:', userProfile)
  console.log('🔗 Acesse: http://localhost:3001/admin-servico')
}

// Executar
setupServicoAgendamento()
