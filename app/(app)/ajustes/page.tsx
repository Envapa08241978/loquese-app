'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthChange, logout, User } from '@/lib/auth';
import { exportConocimientos, importConocimientos } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function AjustesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [exportData, setExportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  const handleExport = async () => {
    if (!user) return;
    try {
      const data = await exportConocimientos(user.uid);
      setExportData(data);
      // Also trigger download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cerebro-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('✅ Datos exportados correctamente');
    } catch (err) {
      console.error('Export error:', err);
      setMessage('❌ Error al exportar');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setImporting(true);
    try {
      const file = e.target.files[0];
      const text = await file.text();
      await importConocimientos(user.uid, text);
      setMessage('✅ Datos importados correctamente');
    } catch (err) {
      console.error('Import error:', err);
      setMessage('❌ Error al importar. Verifica el formato JSON.');
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <h1 className="text-xl font-bold text-white">⚙️ Ajustes</h1>

      {/* User Info */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-bold text-white">
            {user?.displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-white">
              {user?.displayName || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* API Configuration Info */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <h3 className="mb-2 text-sm font-semibold text-cyan-400">
          🔑 API de IA (Gemini)
        </h3>
        <p className="text-xs text-gray-400">
          La API Key de Gemini se configura en el archivo{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-400">
            .env.local
          </code>{' '}
          del servidor. Si ves errores al consultar la IA, verifica que la
          variable{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-400">
            GEMINI_API_KEY
          </code>{' '}
          esté configurada.
        </p>
      </div>

      {/* Export / Import */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400">
          📦 Datos
        </h3>

        <button
          onClick={handleExport}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-left text-sm text-white transition hover:bg-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar conocimientos</p>
              <p className="text-xs text-gray-500">
                Descargar backup en formato JSON
              </p>
            </div>
            <span className="text-gray-400">📥</span>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-left text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {importing ? 'Importando...' : 'Importar conocimientos'}
              </p>
              <p className="text-xs text-gray-500">
                Restaurar desde archivo JSON
              </p>
            </div>
            <span className="text-gray-400">📤</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {exportData && (
          <div className="max-h-40 overflow-auto rounded-xl bg-black/50 p-3">
            <pre className="text-[10px] text-gray-500">{exportData}</pre>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className="rounded-xl bg-white/5 px-4 py-2 text-xs text-gray-300">
          {message}
        </p>
      )}

      {/* Subscription (Future) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-400">
          💎 Plan Actual
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Gratuito</p>
            <p className="text-xs text-gray-500">
              Todas las funciones incluidas
            </p>
          </div>
          <span className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
            Activo
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
      >
        Cerrar sesión
      </button>

      {/* Version */}
      <p className="text-center text-[10px] text-gray-600">
        LoQueSe.com v1.0.0 — Tu memoria técnica multipotencial
      </p>
    </div>
  );
}
