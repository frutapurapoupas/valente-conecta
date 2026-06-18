'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { Menu, X, ShoppingCart, User, Home } from 'lucide-react';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Atualizar contador do carrinho
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
      const total = cart.reduce((sum: number, item: any) => sum + item.quantidade, 0);
      setCartCount(total);
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header do Cliente */}
      <header className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-white p-2 hover:bg-white/20 rounded-xl transition-colors md:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button onClick={() => router.push('/')} className="flex items-center gap-2">
              <span className="text-xl">🍱</span>
              <span className="font-bold text-lg hidden sm:block">Marmita Dona Neide</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/carrinho')} 
              className="relative p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => router.push('/profile')} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Lateral do Cliente (apenas no mobile) */}
      <div 
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden
        `}
      >
        <div className="p-4 pt-16">
          <div className="mb-6 pb-4 border-b">
            <p className="text-gray-600 text-sm">Olá,</p>
            <p className="font-bold text-lg">{user?.nome || 'Visitante'}</p>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => { router.push('/cozinha'); setSidebarOpen(false); }} 
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3"
            >
              <Home className="w-4 h-4" /> Início
            </button>
            <button 
              onClick={() => { router.push('/carrinho'); setSidebarOpen(false); }} 
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3"
            >
              <ShoppingCart className="w-4 h-4" /> Meu Carrinho
            </button>
            <button 
              onClick={() => { router.push('/profile'); setSidebarOpen(false); }} 
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3"
            >
              <User className="w-4 h-4" /> Meu Perfil
            </button>
          </nav>
        </div>
        
        {/* Overlay para fechar o menu */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[-1]"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Conteúdo principal */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation do Cliente (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-40 md:hidden">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => router.push('/cozinha')} 
            className="flex flex-col items-center py-1 px-3 rounded-lg text-green-600"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Início</span>
          </button>
          <button 
            onClick={() => router.push('/carrinho')} 
            className="flex flex-col items-center py-1 px-3 rounded-lg relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs mt-1">Carrinho</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => router.push('/profile')} 
            className="flex flex-col items-center py-1 px-3 rounded-lg"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}