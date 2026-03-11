'use client';

import { CATEGORIAS } from '@/lib/db';

interface CategoryChipsProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const categoryIcons: Record<string, string> = {
  'Programación': '💻',
  'Diseño': '🎨',
  'Construcción': '🏗️',
  'Carpintería': '🪚',
  'Plomería': '🔧',
  'Electricidad': '⚡',
  'Soldadura': '🔥',
  'Música': '🎵',
  'Política': '🏛️',
  'Biotecnología': '🧬',
  'Otro': '📌',
};

export default function CategoryChips({
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-300 ${
          selected === null
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        Todas
      </button>
      {CATEGORIAS.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300 ${
            selected === cat
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span>{categoryIcons[cat]}</span>
          {cat}
        </button>
      ))}
    </div>
  );
}
