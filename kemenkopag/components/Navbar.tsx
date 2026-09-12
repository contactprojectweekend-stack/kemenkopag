'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee, PlusCircle, LogOut } from 'lucide-react';
// PENTING: Gunakan client dari folder client (bukan server)
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  // BENAR: Tanpa 'await' karena ini browser client
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Ambil data user & profile di dalam useEffect
  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }

    getUserData();

    // Pantau perubahan login/logout secara realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-[#F7F1E8]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Brand Kemenkopag */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-sm">
            <Coffee className="w-5 h-5 text-accent" />
          </div>
          <span className="font-extrabold text-xl text-primary-dark tracking-tight">
            Kemenkopag<span className="text-accent">.</span>
          </span>
        </Link>

        {/* Menu Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-primary-dark">
          <Link href="/" className="hover:text-accent transition">Home</Link>
          <Link href="/coffee-shops" className="hover:text-accent transition">Coffee Shop</Link>
          <Link href="/ngopi" className="hover:text-accent font-bold text-primary transition">Ngopi Bareng</Link>
          
          {/* Menu Khusus Admin */}
          {profile?.role === 'admin' && (
            <Link 
              href="/admin" 
              className="text-amber-800 font-bold bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl text-xs transition"
            >
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-3">
          <Link 
            href="/ngopi/create"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:opacity-90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Yuk Ngopi</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary-dark bg-[#F7F1E8] px-3 py-2 rounded-xl">
                {profile?.full_name || 'Teman Ngopi'}
              </span>
              <button 
                onClick={handleLogout}
                title="Keluar"
                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-bold text-primary hover:underline px-2 py-1"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}