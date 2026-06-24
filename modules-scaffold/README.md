# Scaffold de Módulos Compartilhados

Este diretório contém a estrutura base, tipos, componentes e serviços reutilizáveis para implementar rapidamente novos módulos (Saúde, Transporte, Mercado, Academias, etc.) no Valente Conecta.

## Estrutura

```
modules-scaffold/
├── types/
│   └── modules.ts           # Tipos TypeScript compartilhados
├── components/shared/
│   ├── ItemCard.tsx         # Card simples de item
│   ├── ListView.tsx         # Listagem de itens
│   ├── DetailView.tsx       # Detalhe de item
│   ├── Filters.tsx          # Container para filtros
│   ├── EditorForm.tsx       # Formulário de edição
│   ├── AdminTable.tsx       # Tabela para admin
│   └── DemandModal.tsx      # Modal para captura de demandas
├── services/shared/
│   └── storageServices.ts   # Serviços localStorage (CatalogStorage, DemandService, SupplierStorage, UserService)
├── scripts/
│   └── sync-to-supabase.ts  # Template para sincronização localStorage → Supabase
└── README.md                # Este arquivo
```

## Princípios

- **Separação 100% Lógica/Design**: Tipos e serviços compartilhados, componentes UI reutilizáveis com props.
- **localStorage First**: Começar com localStorage, depois migrar para Supabase.
- **Realtime Events**: Cada serviço dispara eventos customizados (`catalogo_itens_updated`, `demandas_updated`, etc.) para sincronizar UI.
- **Type-Safe**: Todos os serviços usam TypeScript e tipos exportados.

## Como Usar

### 1. Importar Tipos

```typescript
import { Item, Demand, User, Supplier, Schedule, QueueEntry } from '@/modules-scaffold/types/modules';
```

### 2. Usar Serviços de Storage

```typescript
import { CatalogStorage, DemandService, SupplierStorage, UserService } from '@/modules-scaffold/services/shared/storageServices';

// Listar itens de uma categoria
const items = CatalogStorage.getAll('saude');

// Adicionar novo item
CatalogStorage.add({
  id: Date.now().toString(),
  nome: 'Consulta Médica',
  categoria: 'saude',
  status: 'publicado',
});

// Adicionar demanda
DemandService.add({
  id: Date.now().toString(),
  categoria: 'saude',
  nomeCliente: 'João Silva',
  descricao: 'Preciso de consulta com cardiologista',
});

// Ouvir atualizações em tempo real
window.addEventListener('catalogo_itens_updated', () => {
  console.log('Catálogo foi atualizado!');
});
```

### 3. Usar Componentes

```tsx
"use client";
import ItemCard from '@/modules-scaffold/components/shared/ItemCard';
import AdminTable from '@/modules-scaffold/components/shared/AdminTable';
import DemandModal from '@/modules-scaffold/components/shared/DemandModal';

export default function MeuModulo() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <h1>Meu Módulo</h1>
      
      {/* Mostrar itens */}
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}

      {/* Tabela admin */}
      <AdminTable
        items={items}
        onEdit={(item) => console.log('Editar', item)}
        onDelete={(id) => console.log('Deletar', id)}
        onToggle={(item) => console.log('Toggle status', item)}
      />

      {/* Modal de demanda */}
      <DemandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoria="meu_modulo"
        onSubmit={(demand) => console.log('Demanda:', demand)}
      />
    </div>
  );
}
```

## Implementar um Novo Módulo

### Passo 1: Criar Pasta do Módulo

```bash
# Exemplo: criar módulo "saude"
mkdir -p app/saude
mkdir -p app/admin-master/saude
```

### Passo 2: Criar Páginas

- `app/saude/public/page.tsx` — Listagem pública com `ItemCard` e `DemandModal`
- `app/saude/supplier/catalog/page.tsx` — Editor para fornecedores (usar `EditorForm`)
- `app/admin-master/saude/page.tsx` — Admin com `AdminTable` para gerenciar itens e demandas

### Passo 3: Usar Serviços

```tsx
// app/saude/public/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item } from '@/modules-scaffold/types/modules';
import ItemCard from '@/modules-scaffold/components/shared/ItemCard';
import DemandModal from '@/modules-scaffold/components/shared/DemandModal';

export default function SaudePublic() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setItems(CatalogStorage.getAll('saude'));
    window.addEventListener('catalogo_itens_updated', () => {
      setItems(CatalogStorage.getAll('saude'));
    });
  }, []);

  return (
    <div>
      <h1>Saúde Valente</h1>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
      <button onClick={() => setModalOpen(true)}>Solicitar Atendimento</button>
      
      <DemandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoria="saude"
        onSubmit={(demand) => {
          DemandService.add({
            id: Date.now().toString(),
            ...demand,
            status: 'pendente',
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}
```

### Passo 4: Adicionar Campos Específicos

Para módulos com campos especiais (ex.: Saúde = fila, Transporte = rota), use `Item.metadadosModulo`:

```typescript
const item: Item = {
  id: '1',
  nome: 'Consulta Clínica',
  categoria: 'saude',
  status: 'publicado',
  metadadosModulo: {
    especialidade: 'Clínica Geral',
    tempo_medio_espera: '15 min',
    posicao_fila: 5,
  },
};
```

## Migração para Supabase

Use o script em `scripts/sync-to-supabase.ts` para sincronizar dados do localStorage para Supabase.

```bash
# Exemplo (após implementar script)
npx ts-node modules-scaffold/scripts/sync-to-supabase.ts
```

## Próximas Implementações

- [ ] Design System com tokens Tailwind
- [ ] Auth & Roles guards
- [ ] Gerador de módulo (CLI)
- [ ] Testes unitários e E2E
- [ ] Admin Master unificado
- [ ] Documentação por módulo

## Contato

Para dúvidas ou sugestões sobre o scaffold, abra uma issue no repositório.
