import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CoffeeShopCard from '@/components/CoffeeShopCard';
import NgopiCard from '@/components/NgopiCard';

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const [shopsRes, invRes] = await Promise.all([
    supabase.from('coffee_shops').select('*').eq('status', 'approved').limit(3),
    supabase.from('ngopi_invitations').select('*, coffee_shops(*)').limit(3),
  ]);

  const shops = shopsRes.data || [];
  const invitations = invRes.data || [];

  return (
    <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
      {/* Hero Section */}
      <section className="bg-cream rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider bg-accent/20 text-primary-dark px-3 py-1 rounded-full">
          Teman untuk ngopi bareng ☕
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-dark">
          Temukan tempat ngopi dan <span className="text-accent">teman ngopi</span>.
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          Ngopi sendiri? Bisa. Ngopi bareng? Jauh lebih seru. Temukan tempat ngopi favoritmu dan buat ajakan sekarang.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/coffee-shops" className="px-6 py-3 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm">
            Jelajahi Coffee Shop
          </Link>
          <Link href="/ngopi/create" className="px-6 py-3 bg-accent text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm">
            Yuk Ngopi Bareng
          </Link>
        </div>
      </section>

      {/* Ajakan Ngopi Bareng (Fitur Pembeda Utama) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Ada yang mau ngopi bareng?</h2>
            <p className="text-xs sm:text-sm text-gray-500">Ajakan ngopi terbaru dari komunitas.</p>
          </div>
          <Link href="/ngopi" className="text-xs font-bold text-accent underline">Lihat Semua</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {invitations.length === 0 ? (
            <p className="text-xs text-gray-400">Belum ada ajakan ngopi saat ini.</p>
          ) : (
            invitations.map((inv) => <NgopiCard key={inv.id} invitation={inv} />)
          )}
        </div>
      </section>

      {/* Rekomendasi Coffee Shop */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Rekomendasi Coffee Shop</h2>
            <p className="text-xs sm:text-sm text-gray-500">Tempat ngopi terverifikasi dan nyaman.</p>
          </div>
          <Link href="/coffee-shops" className="text-xs font-bold text-accent underline">Buka Direktori</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <CoffeeShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </section>
    </div>
  );
}