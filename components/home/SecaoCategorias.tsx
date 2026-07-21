// components/home/SecaoCategorias.tsx
// Substituir FontAwesome por Lucide React

import Link from 'next/link';
import { 
  ShoppingCart, 
  UtensilsCrossed, 
  Dumbbell, 
  Bike, 
  Wrench,
  Store,
  Home,
  Car,
  School,
  Heart,
  Scissors,
  Cake,
  Pizza,
  Truck,
  Smartphone,
  Coffee,
  Beef,
  Package,
  Key,
  Wifi,
  Droplet,
  Hammer,
  Monitor,
  Snowflake,
  Zap,
  Scale,
  Sofa,
  Tv,
  Fridge,
  Paintbrush,
  Saw,
  PartyPopper,
  Dog,
  Shield,
  Video,
  Coins,
  Lock,
  TrendingUp,
  Wallet
} from 'lucide-react';

// Mapear categorias para ícones do Lucide
const iconMap: Record<string, any> = {
  'Marmita': UtensilsCrossed,
  'Academia': Dumbbell,
  'Moto Táxi': Bike,
  'Serviços': Wrench,
  'Mercado': ShoppingCart,
  'Imóvel': Home,
  'Automotivo': Car,
  'Educação': School,
  'Saúde': Heart,
  'Beleza': Scissors,
  'Eventos': PartyPopper,
  'Pet': Dog,
  'Tecnologia': Smartphone,
  'Alimentação': UtensilsCrossed,
  'Transporte': Truck,
  'Construção': Hammer,
  'Móveis': Sofa,
  'Eletrodomésticos': Tv,
  'Agro': Package,
  'Utilidades': Wrench,
  'Moda': Scissors,
  'Financeiro': Wallet,
  'Moeda Conecta': Coins,
  'Segurança': Shield,
  'Vídeos': Video,
};

export default function SecaoCategorias({ categorias }) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
      {categorias.map((categoria) => {
        const Icon = iconMap[categoria.nome] || Store;
        return (
          <Link
            key={categoria.id}
            href={categoria.link || '#'}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition group"
          >
            <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm font-medium mt-2">{categoria.nome}</p>
          </Link>
        );
      })}
    </section>
  );
}

