// components/admin/menu/categories/dashboard.ts
// 📊 ADICIONAR MONITOR AO MENU

import { LayoutDashboard, BarChart3, Brain, FileText, Shield } from "lucide-react";
import { MenuGroup } from "../types";

export const dashboardMenu: MenuGroup[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    collapsible: false,
    items: [
      { name: "Dashboard", path: "/admin-master", icon: LayoutDashboard, status: 'active' },
      { name: "Monitor de Qualidade", path: "/admin-master/monitor", icon: Shield, status: 'active' }, // 🆕
      { name: "Dashboard Gráficos", path: "/admin-master/dashboard-graficos", icon: BarChart3, status: 'construction' },
      { name: "Métricas da Inteligência", path: "/admin-master/metricas-ia", icon: Brain, status: 'construction' },
      { name: "Relatórios", path: "/admin-master/relatorios", icon: FileText, status: 'construction' },
    ]
  }
];