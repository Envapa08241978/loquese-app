'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, User } from '@/lib/auth';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-sm">
              <Image src="/icon-192.png" alt="LoQueSe.com" width={32} height={32} />
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-lg font-bold text-transparent">
              LoQueSe.com
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-xs font-bold text-cyan-400">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>

      <BottomNav />
    </div>
  );
}
