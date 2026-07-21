// components/admin/Sidebar.tsx
// 🎨 DESIGN - Com verificação de ícones

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import adminMenuFull, { MenuGroup, MenuItem } from "./adminMenuFull";

// ============================================================
// COMPONENTE: MenuItem
// ============================================================

function MenuItemComponent({ 
  name, 
  path, 
  icon: Icon, 
  status, 
  isActive 
}: MenuItem & { isActive: boolean }) {
  // ✅ VERIFICA SE O ÍCONE EXISTE
  if (!Icon) {
    console.warn(`⚠️ Ícone não encontrado para: ${name}`);
    return null;
  }

  const isConstruction = status === 'construction';
  
  return (
    <Link
      href={path}
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
  activePath 
}: {
  group: MenuGroup;
  isOpen: boolean;
  onToggle: () => void;
  activePath: string;
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

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-8 px-2">Valente Conecta</h2>
      
      <nav className="space-y-4">
        {adminMenuFull.map((group) => {
          const isOpen = openGroups[group.name] ?? isGroupActive(group);
          
          return (
            <MenuGroupComponent
              key={group.name}
              group={group}
              isOpen={isOpen}
              onToggle={() => toggleGroup(group.name)}
              activePath={pathname}
            />
          );
        })}
      </nav>

      <div className="mt-8 p-2 bg-gray-800 rounded-lg text-center text-xs text-gray-500">
        v2.0 - {adminMenuFull.length} categorias
      </div>
    </aside>
  );
}


