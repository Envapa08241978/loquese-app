'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthChange, User } from '@/lib/auth';
import {
  getAllConocimientos,
  searchConocimientos,
  Conocimiento,
} from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import KnowledgeCard from '@/components/KnowledgeCard';
import AiChat from '@/components/AiChat';

export default function InicioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [conocimientos, setConocimientos] = useState<Conocimiento[]>([]);
  const [filtered, setFiltered] = useState<Conocimiento[]>([]);
  const [showAi, setShowAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllConocimientos(user.uid);
      setConocimientos(data);
      setFiltered(data.slice(0, 5));
    } catch {
      // Firebase not configured yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(searchConocimientos(conocimientos, search));
    } else {
      setFiltered(conocimientos.slice(0, 5));
    }
  }, [search, conocimientos]);

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Hola, {user?.displayName?.split(' ')[0] || 'colega'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ¿Qué necesitas hoy?
        </p>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* AI Button */}
      <button
        onClick={() => setShowAi(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 transition-transform duration-300 group-hover:scale-110">
            <span className="text-2xl">🧠</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">Consultar a mi IA</p>
            <p className="text-xs text-gray-400">
              Busca en tu memoria y conecta conocimientos
            </p>
          </div>
          <svg
            className="ml-auto h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-white">{conocimientos.length}</p>
          <p className="text-xs text-gray-500">Conocimientos</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <p className="text-2xl font-bold text-white">
            {new Set(conocimientos.map((c) => c.habilidad)).size}
          </p>
          <p className="text-xs text-gray-500">Categorías</p>
        </div>
      </div>

      {/* Recent / Search Results */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-400">
          {search ? `Resultados para "${search}"` : 'Recientes'}
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <KnowledgeCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
            <p className="text-sm text-gray-500">
              {search
                ? 'No se encontraron resultados'
                : 'Aún no tienes conocimientos. ¡Agrega el primero!'}
            </p>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      {user && (
        <AiChat
          userId={user.uid}
          isOpen={showAi}
          onClose={() => setShowAi(false)}
        />
      )}
    </div>
  );
}
