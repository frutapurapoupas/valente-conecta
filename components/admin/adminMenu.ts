import { LayoutDashboard, Wallet, Video, Settings } from "lucide-react";

export const adminMenu = [
  { name: "Dashboard", path: "/admin-master", icon: LayoutDashboard },
  { name: "Financeiro Pessoal", path: "/admin-master/financeiro-pessoal", icon: Wallet },
  { name: "Fábrica de Vídeos", path: "/admin-master/fabrica-videos", icon: Video },
  { name: "Configurações", path: "/admin-master/config", icon: Settings },
];

