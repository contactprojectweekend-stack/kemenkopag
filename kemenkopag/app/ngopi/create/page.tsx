'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, MapPin } from 'lucide-react';

const CITIES = ['Semua Kota', 'Surabaya', 'Sidoarjo', 'Malang', 'Jakarta', 'Bandung', 'Yogyakarta'];

export default function CreateNgopiPage() {
  const router = useRouter();
  const supabase = createClient();

  const [allShops, setAllShops] = useState<any[]>([]);
  const [filteredShops, setFilteredShops] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shopId, setShopId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [topic, setTopic] = useState('Casual Hangout');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchShops() {
      const { data } = await supabase.from('coffee_shops').select('id, name, city, address').eq('status', 'approved');
      if (data) {
        setAllShops(data);
        setFilteredShops(data);
      }
    }
    fetchShops();
  }, []);

  // Filter café setiap kali pengguna memilih kota
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShopId(''); // Reset pilihan café sebelumnya
    if (!city || city === 'Semua Kota') {
      setFilteredShops(allShops);
    } else {
      setFilteredShops(allShops.filter((s) => s.city.toLowerCase() === city.toLowerCase()));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Silakan masuk/login terlebih dahulu untuk membuat ajakan ngopi.');
      router.push('/login');
      return;
    }

    if (!shopId) {
      alert('Pilih coffee shop terlebih dahulu.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('ngopi_invitations').insert({
      creator_id: user.id,
      coffee_shop_id: shopId,
      title,
      description,
      meeting_date: date,
      meeting_time: time,
      max_participants: maxParticipants,
      topic,
    });

    if (error) {
      alert('Gagal: ' + error.message);
    } else {
      alert('Ajakan ngopi berhasil dibuat!');
      router.push('/ngopi');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-24">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream shadow-sm space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-dark">Buat Ajakan Ngopi</h1>
          <p className="text-xs text-gray-500 mt-1">Ajak teman baru untuk ngobrol santai atau kerja bareng.</p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2.5 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <p>Selalu utamakan bertemu di coffee shop umum dan jaga privasi informasi pribadi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-primary-dark block mb-1">Judul Ajakan</label>
            <input 
              required
              placeholder="Contoh: Ngopi santai sore sambil sharing portfolio" 
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* PILIH KOTA TERLEBIH DAHULU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary-dark block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent" /> 1. Pilih Kota
              </label>
              <select 
                required
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="">-- Pilih Kota Dulu --</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* DROPDOWN COFFEE SHOP YANG MENYESUAIKAN DENGAN KOTA */}
            <div>
              <label className="font-bold text-primary-dark block mb-1">
                2. Pilih Coffee Shop ({filteredShops.length} tersedia)
              </label>
              <select 
                required
                disabled={filteredShops.length === 0}
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none bg-white font-medium disabled:bg-gray-100 disabled:text-gray-400"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                <option value="">-- Pilih Coffee Shop --</option>
                {filteredShops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary-dark block mb-1">Tanggal</label>
              <input 
                type="date"
                required
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="font-bold text-primary-dark block mb-1">Waktu</label>
              <input 
                type="time"
                required
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-primary-dark block mb-1">Maks. Peserta</label>
              <input 
                type="number"
                min="2"
                max="10"
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="font-bold text-primary-dark block mb-1">Topik Obrolan</label>
              <select 
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none bg-white"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="Casual Hangout">Casual Hangout</option>
                <option value="WFC & Remote Work">WFC & Remote Work</option>
                <option value="Manual Brew & Beans">Manual Brew & Beans</option>
                <option value="Business & Networking">Business & Networking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-primary-dark block mb-1">Catatan / Deskripsi Singkat</label>
            <textarea 
              rows={3}
              placeholder="Ceritakan rencana santaimu..."
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Menerbitkan...' : 'Terbitkan Ajakan Ngopi'}
          </button>
        </form>
      </div>
    </div>
  );
}