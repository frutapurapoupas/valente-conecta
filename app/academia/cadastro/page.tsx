const handleSubmit = async () => {
  try {
    // 1. Pegar o usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('⚠️ Erro: Usuário não identificado. Faça login novamente.')
      return
    }

    // 2. Salvar os dados e colocar em espera (pendente)
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        academia_dados: formData, 
        status_academia: 'pendente', // Definimos como pendente por padrão
        updated_at: new Date()
      })
      .eq('id', user.id)

    if (error) throw error

    // 3. Limpar localstorage e avisar
    localStorage.setItem('academia_cadastro_completo', 'true')
    alert('🔥 CADASTRO CONCLUÍDO! Agora o Admin Master vai validar seu acesso. Você será avisado no WhatsApp!')
    
    router.push('/academia') // Ele volta para a tela inicial que terá o aviso de bloqueio
  } catch (err) {
    alert('Erro ao salvar cadastro. Tente novamente.')
    console.error(err)
  }
}