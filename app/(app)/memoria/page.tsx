'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, User } from '@/lib/auth';
import {
  getAllConocimientos,
  getConocimientosByCategoria,
  deleteConocimiento,
  searchConocimientos,
  Conocimiento,
} from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import KnowledgeCard from '@/components/KnowledgeCard';
import CategoryChips from '@/components/CategoryChips';

export default function MemoriaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [conocimientos, setConocimientos] = useState<Conocimiento[]>([]);
  const [filtered, setFiltered] = useState<Conocimiento[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  const fetchAllCategories = useCallback(async () => {
    if (!user) return;
    try {
      const allDocs = await getAllConocimientos(user.uid);
      const uniqueCats = Array.from(new Set(allDocs.map((c) => c.habilidad)));
      setCategories(uniqueCats);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: Conocimiento[];
      if (category) {
        data = await getConocimientosByCategoria(user.uid, category);
      } else {
        data = await getAllConocimientos(user.uid);
      }
      setConocimientos(data);
      setFiltered(data);
    } catch {
      // Firebase not configured
    } finally {
      setLoading(false);
    }
  }, [user, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (search.trim()) {
      setFiltered(searchConocimientos(conocimientos, search));
    } else {
      setFiltered(conocimientos);
    }
  }, [search, conocimientos]);

  const handleDelete = async (id: string) => {
    if (!user || !confirm('¿Eliminar este conocimiento?')) return;
    try {
      await deleteConocimiento(user.uid, id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleEdit = (item: Conocimiento) => {
    router.push(`/agregar?id=${item.id}`);
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-xl font-bold text-white">📚 Memoria Técnica</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar conocimientos..."
      />

      <CategoryChips categories={categories} selected={category} onSelect={setCategory} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {filtered.length} conocimiento{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((item) => (
            <div key={item.id} className="animate-slideUp">
              <KnowledgeCard
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="mb-4 text-5xl">📭</span>
          <p className="text-sm text-gray-500">
            {search || category
              ? 'No se encontraron resultados con esos filtros'
              : 'Tu memoria está vacía. ¡Empieza a agregar conocimientos!'}
          </p>
          {!search && !category && (
            <button
              onClick={() => router.push('/agregar')}
              className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Agregar primero
            </button>
          )}
        </div>
      )}
    </div>
  );
}
