'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { onAuthChange, User } from '@/lib/auth';
import {
  addConocimiento,
  updateConocimiento,
  getConocimiento,
  getAllConocimientos,
  uploadMultimedia,
} from '@/lib/db';
import { useVoice } from '@/lib/voice';

function AgregarForm() {
  const [user, setUser] = useState<User | null>(null);
  const [habilidad, setHabilidad] = useState('');
  const [snippet, setSnippet] = useState('');
  const [contexto, setContexto] = useState('');
  const [multimedia, setMultimedia] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isListening, transcript, startListening, isSupported } = useVoice();
  const [voiceTarget, setVoiceTarget] = useState<'snippet' | 'contexto' | 'habilidad'>('snippet');

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (transcript) {
      if (voiceTarget === 'snippet') {
        setSnippet((prev) => (prev ? prev + ' ' : '') + transcript);
      } else if (voiceTarget === 'contexto') {
        setContexto((prev) => (prev ? prev + ' ' : '') + transcript);
      } else {
        setHabilidad(transcript);
      }
    }
  }, [transcript, voiceTarget]);

  const loadExisting = useCallback(async () => {
    if (user) {
      // Load all previous categories for autocompletion
      try {
        const allDocs = await getAllConocimientos(user.uid);
        const uniqueCats = Array.from(new Set(allDocs.map((c) => c.habilidad)));
        setAvailableCategories(uniqueCats);
      } catch (e) {
        console.error("Error loading categories", e);
      }

      const id = searchParams.get('id');
      if (id) {
        setEditId(id);
        const data = await getConocimiento(user.uid, id);
        if (data) {
          setHabilidad(data.habilidad);
          setSnippet(data.snippet_conocimiento);
          setContexto(data.contexto_uso);
          setMultimedia(data.multimedia_ref || '');
          setTags(data.tags?.join(', ') || '');
        }
      }
    }
  }, [searchParams, user]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !habilidad.trim() || !snippet.trim()) return;

    setSaving(true);
    try {
      let finalMultimediaUrl = multimedia.trim();

      if (file) {
        setUploading(true);
        finalMultimediaUrl = await uploadMultimedia(user.uid, file);
        setUploading(false);
      }

      const data = {
        habilidad: habilidad.trim(),
        snippet_conocimiento: snippet.trim(),
        contexto_uso: contexto.trim(),
        multimedia_ref: finalMultimediaUrl,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editId) {
        await updateConocimiento(user.uid, editId, data);
      } else {
        await addConocimiento(user.uid, data);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/memoria');
      }, 1000);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Error al guardar. Verifica que Firebase esté configurado.');
    } finally {
      setSaving(false);
    }
  };

  const handleVoice = (target: 'snippet' | 'contexto' | 'habilidad') => {
    setVoiceTarget(target);
    startListening();
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-scaleIn">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">
          {editId ? '¡Actualizado!' : '¡Guardado!'}
        </h2>
        <p className="text-sm text-gray-500">Redirigiendo a tu memoria...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-4">
      <h1 className="text-xl font-bold text-white">
        {editId ? '✏️ Editar Conocimiento' : '➕ Agregar Conocimiento'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">
              Habilidad / Categoría *
            </label>
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoice('habilidad')}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition ${
                  isListening && voiceTarget === 'habilidad'
                    ? 'animate-pulse bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-gray-500 hover:text-cyan-400'
                }`}
              >
                🎤 Dictar
              </button>
            )}
          </div>
          <input
            type="text"
            list="categories-list"
            value={habilidad}
            onChange={(e) => setHabilidad(e.target.value)}
            placeholder="Ej: Cocina, Finanzas, TIG, Carpintería..."
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50"
          />
          <datalist id="categories-list">
            {availableCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>

        {/* Snippet */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">
              Conocimiento / Técnica *
            </label>
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoice('snippet')}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition ${
                  isListening && voiceTarget === 'snippet'
                    ? 'animate-pulse bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-gray-500 hover:text-cyan-400'
                }`}
              >
                🎤 Dictar
              </button>
            )}
          </div>
          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            placeholder="Describe el procedimiento, truco o técnica que dominas..."
            rows={5}
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50"
          />
        </div>

        {/* Context */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400">
              Contexto de Uso
            </label>
            {isSupported && (
              <button
                type="button"
                onClick={() => handleVoice('contexto')}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition ${
                  isListening && voiceTarget === 'contexto'
                    ? 'animate-pulse bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-gray-500 hover:text-cyan-400'
                }`}
              >
                🎤 Dictar
              </button>
            )}
          </div>
          <textarea
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            placeholder="¿En qué situación laboral o personal lo aplicaste?"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50"
          />
        </div>

        {/* Multimedia */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Referencia Multimedia (Imagen/Video o URL)
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setMultimedia('');
                }
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-400 hover:file:bg-cyan-500/30"
            />
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[10px] text-gray-500">O PEGA UNA URL</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <input
              type="url"
              value={multimedia}
              onChange={(e) => {
                setMultimedia(e.target.value);
                setFile(null);
              }}
              placeholder="https://..."
              disabled={!!file}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Tags (separados por coma)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tig, aluminio, 2mm, corriente alterna"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !habilidad || !snippet}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-40"
        >
          {saving
            ? uploading ? 'Subiendo archivo...' : 'Guardando...'
            : editId
              ? 'Actualizar Conocimiento'
              : 'Guardar Conocimiento'}
        </button>
      </form>
    </div>
  );
}

export default function AgregarPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    }>
      <AgregarForm />
    </Suspense>
  );
}
