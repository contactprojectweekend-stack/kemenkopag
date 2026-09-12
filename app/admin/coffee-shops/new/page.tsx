'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import InstagramIcon from '@/components/icons/InstagramIcon';
import { extractCoordsFromGoogleMaps } from '@/lib/maps';

export default function NewCoffeeShopPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // State Link Google Maps
  const [mapsLink, setMapsLink] = useState('');
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [parseError, setParseError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    city: 'Surabaya',
    address: '',
    price_range: 'Rp 25.000 - Rp 50.000',
    opening_hours: '08:00 - 22:00',
    cover_image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    instagram: '',
    description: '',
  });

  const handleMapsLinkChange = (value: string) => {
    setMapsLink(value);
    setParseError('');

    if (!value.trim()) {
      setDetectedCoords(null);
      return;
    }

    const coords = extractCoordsFromGoogleMaps(value);
    if (coords) {
      setDetectedCoords(coords);
    } else {
      setDetectedCoords(null);
      setParseError('Format link belum terdeteksi. Gunakan link browser Google Maps yang memuat angka koordinat.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detectedCoords) {
      alert('Silakan masukkan Link Google Maps yang valid untuk menentukan koordinat kafe!');
      return;
    }

    setLoading(true);

    const slug =
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const { error } = await supabase.from('coffee_shops').insert({
      ...formData,
      latitude: detectedCoords.lat,
      longitude: detectedCoords.lng,
      slug,
      status: 'approved',
      is_verified: true,
    });

    if (error) {
      alert('Gagal menambah café: ' + error.message);
    } else {
      alert('Coffee Shop berhasil ditambahkan!');
      router.push('/admin');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-[#5C3A21] mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F7F1E8] shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#2B1B12]">Tambah Coffee Shop Baru</h1>
          <p className="text-xs text-gray-500">Lengkapi profil kafe, lokasi maps, dan media sosialnya.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold block mb-1 text-[#2B1B12]">Nama Coffee Shop</label>
            <input
              required
              placeholder="Contoh: Senja Seduh Coffee"
              className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 text-[#2B1B12]">Kota</label>
              <input
                required
                placeholder="Contoh: Surabaya"
                className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-[#2B1B12]">Rentang Harga</label>
              <select
                className="w-full p-2.5 border rounded-xl outline-none bg-white font-medium"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
              >
                <option value="Rp 15.000 - Rp 30.000">Rp 15.000 - Rp 30.000 (Terjangkau)</option>
                <option value="Rp 25.000 - Rp 50.000">Rp 25.000 - Rp 50.000 (Standar Kafe)</option>
                <option value="Rp 50.000 - Rp 100.000">Rp 50.000 - Rp 100.000 (Specialty / Premium)</option>
                <option value="> Rp 100.000">&gt; Rp 100.000 (Eksklusif)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-[#2B1B12]">Alamat Lengkap</label>
            <input
              required
              placeholder="Contoh: Jl. Ponti No. 12"
              className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* INPUT: MEDIA SOSIAL INSTAGRAM */}
          <div>
            <label className="font-bold block mb-1 text-[#2B1B12] flex items-center gap-1.5">
<InstagramIcon className="w-4 h-4 text-pink-600" />

              Instagram Coffee Shop
            </label>
            <input
              placeholder="Contoh: @senjaseduh.id atau https://instagram.com/senjaseduh.id"
              className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />
            <p className="text-[11px] text-gray-400 mt-1">Bisa diketik username dengan awalan @ atau langsung link URL profil.</p>
          </div>

          {/* INPUT: LINK GOOGLE MAPS */}
          <div className="bg-[#FCFAF7] p-4 rounded-2xl border border-[#F7F1E8] space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold block text-[#2B1B12] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C98B5B]" />
                Link Google Maps Lokasi
              </label>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#C98B5B] hover:underline flex items-center gap-1 font-semibold"
              >
                Buka Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="text"
              required
              placeholder="Tempel tautan Google Maps di sini"
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#5C3A21] text-xs"
              value={mapsLink}
              onChange={(e) => handleMapsLinkChange(e.target.value)}
            />

            {detectedCoords && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Koordinat terdeteksi: Lat {detectedCoords.lat}, Lng {detectedCoords.lng}</span>
              </div>
            )}

            {parseError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1 text-[#2B1B12]">Jam Buka</label>
              <input
                className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
                value={formData.opening_hours}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-[#2B1B12]">URL Foto Cover</label>
              <input
                className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-[#2B1B12]">Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Ceritakan keunikan kafe ini..."
              className="w-full p-2.5 border rounded-xl outline-none focus:border-[#5C3A21]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#5C3A21] hover:bg-[#432A18] text-white font-bold rounded-xl disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Menyimpan...' : 'Simpan Coffee Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}