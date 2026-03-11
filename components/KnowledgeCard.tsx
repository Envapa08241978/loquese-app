'use client';

import { Conocimiento } from '@/lib/db';

interface KnowledgeCardProps {
  item: Conocimiento;
  onEdit?: (item: Conocimiento) => void;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  'Programación': 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  'Diseño': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'Construcción': 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  'Carpintería': 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  'Plomería': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  'Electricidad': 'from-yellow-500/20 to-lime-500/20 border-yellow-500/30',
  'Soldadura': 'from-red-500/20 to-orange-500/20 border-red-500/30',
  'Música': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  'Política': 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
  'Biotecnología': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  'Otro': 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
};

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

export default function KnowledgeCard({
  item,
  onEdit,
  onDelete,
}: KnowledgeCardProps) {
  const colors = categoryColors[item.habilidad] || categoryColors['Otro'];
  const icon = categoryIcons[item.habilidad] || '📌';

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colors} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80">
            {item.habilidad}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              title="Editar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && item.id && (
            <button
              onClick={() => onDelete(item.id!)}
              className="rounded-lg bg-white/10 p-2 text-white/60 transition hover:bg-red-500/30 hover:text-red-400"
              title="Eliminar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="mb-2 line-clamp-3 text-sm leading-relaxed text-white/70">
        {item.snippet_conocimiento}
      </p>

      {/* Context */}
      {item.contexto_uso && (
        <p className="mb-3 text-xs italic text-white/40">
          📍 {item.contexto_uso}
        </p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {item.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-white/30">
        <span>
          {item.fecha_actualizacion
            ? new Date(item.fecha_actualizacion).toLocaleDateString('es-MX')
            : ''}
        </span>
        {item.multimedia_ref && (
          <a
            href={item.multimedia_ref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/60 hover:text-cyan-400"
          >
            🔗 Referencia
          </a>
        )}
      </div>
    </div>
  );
}
