'use client';

import { useVoice } from '@/lib/voice';
import { useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar en tu memoria técnica...',
}: SearchBarProps) {
  const { isListening, transcript, startListening, isSupported } = useVoice();

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  return (
    <div className="relative">
      <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-cyan-500/50 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <svg
          className="ml-4 h-5 w-5 flex-shrink-0 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-4 text-white placeholder-gray-500 outline-none"
        />
        {isSupported && (
          <button
            onClick={startListening}
            className={`mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
              isListening
                ? 'animate-pulse bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400'
            }`}
            title="Dictado por voz"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
