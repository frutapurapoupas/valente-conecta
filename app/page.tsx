// SCRIPT DE DIAGNÓSTICO E CORREÇÃO DOS CARDS
(async function fixCards() {
  console.log('=== INICIANDO CORREÇÃO DOS CARDS ===');
  
  // 1. Verificar o que existe no momento
  const main = document.querySelector('main');
  const existingGrid = document.querySelector('.grid-cols-2, .cards-grid');
  
  console.log('Main encontrado:', !!main);
  console.log('Grid existente:', !!existingGrid);
  
  if (!main) {
    console.log('ERRO: Main não encontrado!');
    return;
  }
  
  // 2. Remover qualquer grid existente que possa estar quebrado
  const oldGrids = main.querySelectorAll('.grid-cols-2, .cards-grid');
  oldGrids.forEach(grid => {
    console.log('Removendo grid antigo');
    grid.remove();
  });
  
  // 3. Criar o novo grid com os 8 cards
  const cardsHTML = `
    <div class="cards-grid" style="display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 1rem !important; width: 100% !important; margin-top: 1rem;">
      <!-- Card 1 - PDV -->
      <a href="/pdv" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none; transition: all 0.2s;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #10b981;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">PDV Colaborativo</span>
      </a>
      
      <!-- Card 2 - Serviços -->
      <a href="/admin/agendamento" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #60a5fa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Serviços</span>
      </a>
      
      <!-- Card 3 - Planos -->
      <a href="/planos" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #a855f7;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Planos da Loja</span>
      </a>
      
      <!-- Card 4 - Ofertas -->
      <a href="/anuncios" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #f97316;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><path d="M12 12v6"/><path d="M3 11h18"/><path d="M8 7h8"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Ofertas & Ads</span>
      </a>
      
      <!-- Card 5 - Catálogo -->
      <a href="/catalogo" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #ec4899;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Catálogo Digital</span>
      </a>
      
      <!-- Card 6 - Academia -->
      <a href="/academia" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #06b6d4;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Academia Valente</span>
      </a>
      
      <!-- Card 7 - Profissionais -->
      <a href="/admin/profissionais" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #6366f1;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Profissionais</span>
      </a>
      
      <!-- Card 8 - Ambulantes -->
      <a href="/ambulantes" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; background: #18181b; border: 1px solid #27272a; border-radius: 32px; height: 176px; text-decoration: none;">
        <div style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.05); margin-bottom: 1rem; color: #a1a1aa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        </div>
        <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #d4d4d8; text-align: center; font-style: italic;">Rede Ambulantes</span>
      </a>
    </div>
  `;
  
  // 4. Inserir o grid após o último elemento (depois do saldo)
  const saldoDiv = main.querySelector('.bg-zinc-900\\/50, [class*="bg-zinc-900"]');
  if (saldoDiv) {
    saldoDiv.insertAdjacentHTML('afterend', cardsHTML);
    console.log('✅ Cards inseridos após o saldo!');
  } else {
    main.insertAdjacentHTML('beforeend', cardsHTML);
    console.log('✅ Cards inseridos no final do main!');
  }
  
  // 5. Verificar resultado
  const newCards = document.querySelectorAll('.cards-grid a');
  console.log(`✅ Total de cards agora: ${newCards.length}`);
  
  if (newCards.length === 8) {
    console.log('🎉 SUCESSO! Os 8 cards foram carregados!');
  } else {
    console.log(`⚠️ Ainda com problema: ${newCards.length} cards encontrados`);
  }
})();