import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Navigation, PlusCircle, CheckCircle2 } from 'lucide-react';
import { formatInstagram } from '@/lib/social';

export const revalidate = 0;

// Komponen SVG Instagram Mandiri (Bebas Error Paket lucide-react)
function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Di Next.js 15, params berstatus Promise
export default async function CoffeeShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. Wajib di-await di Next.js 15
  const { slug } = await params;
  const supabase = await createClient();

  // 2. Ambil data coffee shop
  const { data: shop, error } = await supabase
    .from('coffee_shops')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !shop) {
    return notFound();
  }

  // 3. Format Link Google Maps & Instagram
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
  const instagramData = formatInstagram(shop.instagram);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Cover Image */}
      <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-[#F7F1E8] shadow-sm relative bg-gray-100">
        <img
          src={shop.cover_image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        {shop.is_verified && (
          <span className="absolute top-4 left-4 bg-[#5C3A21] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C98B5B]" /> Terverifikasi
          </span>
        )}
      </div>

      {/* Detail Coffee Shop */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F7F1E8] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1B12]">{shop.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-[#C98B5B]" /> {shop.address}, {shop.city}
            </p>
          </div>

          {/* Tombol Aksi: Instagram, Google Maps, Ajukan Ngopi */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Instagram jika tersedia */}
            {instagramData && (
              <a
                href={instagramData.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Kunjungi Instagram ${shop.name}`}
                className="px-3.5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>{instagramData.handle}</span>
              </a>
            )}

            {/* Tombol Petunjuk Arah Google Maps */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Petunjuk Arah</span>
            </a>

            {/* Tombol Utama: Ajukan Ngopi di Sini */}
            <Link
              href={`/ngopi/create?shop_id=${shop.id}`}
              className="px-4 py-2.5 bg-[#5C3A21] hover:bg-[#432A18] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Ngopi di Sini</span>
            </Link>
          </div>
        </div>

        <hr className="border-[#F7F1E8]" />

        {/* Ringkasan Informasi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#F7F1E8]/50">
            <p className="text-xs text-gray-400">Rentang Harga</p>
            <p className="font-bold text-[#2B1B12] text-xs sm:text-sm">
              {shop.price_range || 'Rp 25.000 - Rp 50.000'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7F1E8]/50">
            <p className="text-xs text-gray-400">Jam Buka</p>
            <p className="font-bold text-[#2B1B12] text-xs">
              {shop.opening_hours || '08:00 - 22:00'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7F1E8]/50">
            <p className="text-xs text-gray-400">Kota</p>
            <p className="font-bold text-[#2B1B12] text-xs">{shop.city}</p>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7F1E8]/50">
            <p className="text-xs text-gray-400">Instagram</p>
            <p className="font-bold text-[#2B1B12] text-xs truncate">
              {instagramData ? (
                <a
                  href={instagramData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:underline"
                >
                  {instagramData.handle}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C98B5B] mb-2">
            Tentang Coffee Shop Ini
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {shop.description || 'Belum ada deskripsi untuk coffee shop ini.'}
          </p>
        </div>
      </div>
    </div>
  );
}