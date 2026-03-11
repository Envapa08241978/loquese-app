'use client';

import { useState, useEffect, useCallback } from 'react';
import { consultarIA } from '@/lib/ai';
import { getAllConocimientos, Conocimiento } from '@/lib/db';
import { useVoice } from '@/lib/voice';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface AiChatProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChat({ userId, isOpen, onClose }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { isListening, transcript, startListening, isSupported } = useVoice();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Fetch user's knowledge base for context
      const conocimientos = await getAllConocimientos(userId);
      const contextData = conocimientos
        .map(
          (c: Conocimiento) =>
            `[${c.habilidad}] ${c.snippet_conocimiento} (Contexto: ${c.contexto_uso}) - [Adjunto/Enlace: ${c.multimedia_ref || 'Ninguno'}]`
        )
        .join('\n');

      const respuesta = await consultarIA(userMessage, contextData);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: respuesta },
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0f]/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-sm">
            <Image src="/icon-192.png" alt="LoQueSe.com" width={40} height={40} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Asistente IA</h2>
            <p className="text-xs text-gray-500">Tu colega multipotencial</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl shadow-2xl shadow-cyan-500/20">
              <Image src="/icon-192.png" alt="LoQueSe.com" width={80} height={80} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              ¿En qué puedo ayudarte?
            </h3>
            <p className="max-w-sm text-sm text-gray-500">
              Consulta cualquier cosa. Revisaré tu base de conocimientos y
              conectaré áreas para darte la mejor solución.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                '¿Cómo soldar aluminio TIG?',
                'Automatizar riego con Arduino',
                'Conexión eléctrica trifásica',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'border border-white/10 bg-white/5 text-gray-200'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          {isSupported && (
            <button
              onClick={startListening}
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                isListening
                  ? 'animate-pulse bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
