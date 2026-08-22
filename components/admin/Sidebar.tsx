// components/admin/Sidebar.tsx
// 🎨 DESIGN - Com verificação de ícones
//
// Responsivo: em telas md+ fica fixo do lado esquerdo, como sempre foi. Em
// celular/tablet vira uma gaveta (drawer) fechada por padrão, acionada por
// um botão flutuante — antes disso o menu ficava sempre aberto ocupando a
// tela toda e escondia o conteúdo principal no mobile. Tambem ganhou um
// campo de busca, pois com ~190 itens em quase 40 categorias, achar algo
// rolando a lista inteira em tela pequena era inviável.

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Menu, X, Search } from "lucide-react";
import adminMenuFull, { MenuGroup, MenuItem } from "./adminMenuFull";
import AdminInstallButton from "./AdminInstallButton";

// ============================================================
// COMPONENTE: MenuItem
// ============================================================

function MenuItemComponent({
  name,
  path,
  icon: Icon,
  status,
  isActive,
  onNavigate,
}: MenuItem & { isActive: boolean; onNavigate: () => void }) {
  // ✅ VERIFICA SE O ÍCONE EXISTE
  if (!Icon) {
    console.warn(`⚠️ Ícone não encontrado para: ${name}`);
    return null;
  }

  const isConstruction = status === 'construction';

  return (
    <Link
      href={path}
      onClick={onNavigate}
      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-green-600 text-white"
          : "hover:bg-gray-800 text-gray-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />  {/* ✅ AGORA Icon É GARANTIDO */}
        <span className="text-sm">{name}</span>
      </div>
      {isConstruction && (
        <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded-full text-white">
          🚧
        </span>
      )}
    </Link>
  );
}

// ============================================================
// COMPONENTE: MenuGroup
// ============================================================

function MenuGroupComponent({
  group,
  isOpen,
  onToggle,
  activePath,
  onNavigate,
}: {
  group: MenuGroup;
  isOpen: boolean;
  onToggle: () => void;
  activePath: string;
  onNavigate: () => void;
}) {
  // ✅ VERIFICA SE O ÍCONE DO GRUPO EXISTE
  const GroupIcon = group.icon;

  return (
    <div className="border-b border-gray-800 pb-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {GroupIcon && <GroupIcon size={18} />}
          <span className="font-medium text-sm">{group.name}</span>
          {group.description && (
            <span className="text-xs text-gray-500 ml-1">
              ({group.description})
            </span>
          )}
        </div>
        {group.collapsible ? (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : null}
      </button>

      {(isOpen || !group.collapsible) && (
        <div className="ml-4 space-y-1 mt-1">
          {group.items.map((item) => {
            // ✅ VERIFICA SE O ITEM TEM ÍCONE
            if (!item.icon) {
              console.warn(`⚠️ Item sem ícone: ${item.name}`);
              return null;
            }
            return (
              <MenuItemComponent
                key={item.path}
                {...item}
                isActive={item.path === activePath}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busca, setBusca] = useState("");

  // Fecha a gaveta automaticamente ao navegar — sem isso o menu ficava
  // aberto por cima da página de destino no celular.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ✅ VERIFICA SE O MENU EXISTE
  if (!adminMenuFull || adminMenuFull.length === 0) {
    return (
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
        <p className="text-gray-400">⚠️ Menu não carregado</p>
      </aside>
    );
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isGroupActive = (group: MenuGroup) =>
    group.items.some((item) => item.path === pathname);

  const buscaNormalizada = busca.trim().toLowerCase();
  const grupoFiltrados = useMemo(() => {
    if (!buscaNormalizada) return adminMenuFull;
    return adminMenuFull
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.name.toLowerCase().includes(buscaNormalizada)),
      }))
      .filter((group) => group.items.length > 0);
  }, [buscaNormalizada]);

  return (
    <>
      {/* Botão flutuante — só existe pra abrir a gaveta no mobile/tablet */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          className="md:hidden fixed top-3 left-3 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-gray-900 text-white shadow-lg border border-gray-700"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Fundo escuro atrás da gaveta — toca pra fechar */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        className={`bg-gray-900 text-white overflow-y-auto
          fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:z-auto md:w-64 md:min-h-screen md:translate-x-0 p-4`}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-bold">Valente Conecta</h2>
          <button onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="md:hidden text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <AdminInstallButton />

        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no menu..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        <nav className="space-y-4">
          {grupoFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm px-2">Nada encontrado pra "{busca}".</p>
          ) : (
            grupoFiltrados.map((group) => {
              const isOpen = buscaNormalizada ? true : openGroups[group.name] ?? isGroupActive(group);

              return (
                <MenuGroupComponent
                  key={group.name}
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => toggleGroup(group.name)}
                  activePath={pathname || ''}
                  onNavigate={() => setMobileOpen(false)}
                />
              );
            })
          )}
        </nav>

        <div className="mt-8 p-2 bg-gray-800 rounded-lg text-center text-xs text-gray-500">
          v2.0 - {adminMenuFull.length} categorias
        </div>
      </aside>
    </>
  );
}
