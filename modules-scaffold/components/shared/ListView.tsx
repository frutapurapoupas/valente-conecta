"use client";
import React from 'react';
import { Item } from '@/modules-scaffold/types/modules';
import ItemCard from './ItemCard';

export default function ListView({
  items,
  onSelect,
  emptyMessage = 'Nenhum item encontrado',
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}: {
  items: Item[];
  onSelect?: (item: Item) => void;
  emptyMessage?: string;
  gridCols?: string;
}) {
  if (!items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onSelect={onSelect ? () => onSelect(item) : undefined}
        />
      ))}
    </div>
  );
}
