// components/admin/menu/categories/dashboard.ts
// ðŸ“Š ADICIONAR MONITOR AO MENU

import { LayoutDashboard, BarChart3, Brain, FileText, Shield } from "lucide-react";
import { MenuGroup } from "../types";

export const dashboardMenu: MenuGroup[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    collapsible: false,
    items: [
      { name: "Dashboard", path: "/admin-master", icon: LayoutDashboard, status: 'active' },
      { name: "Monitor de Qualidade", path: "/admin-master/monitor", icon: Shield, status: 'active' }, // ðŸ†•
      { name: "Dashboard GrÃ¡ficos", path: "/admin-master/dashboard-graficos", icon: BarChart3, status: 'construction' },
      { name: "MÃ©tricas da InteligÃªncia", path: "/admin-master/metricas-ia", icon: Brain, status: 'construction' },
      { name: "RelatÃ³rios", path: "/admin-master/relatorios", icon: FileText, status: 'construction' },
    ]
  }
];

