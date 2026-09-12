'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditNgopiPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    meeting_date: '',
    meeting_time: '',
    max_participants: 4,
    description: '',
  });

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('ngopi_invitations').select('*').eq('id', params.id).single();
      if (data) {
        setFormData({
          title: data.title || '',
          topic: data.topic || '',
          meeting_date: data.meeting_date || '',
          meeting_time: data.meeting_time || '',
          max_participants: data.max_participants || 4,
          description: data.description || '',
        });
      }
      setFetching(false);
    }
    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('ngopi_invitations')
      .update(formData)
      .eq('id', params.id);

    if (error) {
      alert('Gagal mengupdate ajakan: ' + error.message);
    } else {
      alert('Ajakan ngopi berhasil diperbarui!');
      router.push('/admin');
      router.refresh();
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-8 text-center text-xs text-gray-500">Memuat ajakan ngopi...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Admin Panel
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-primary-dark">Edit Ajakan Ngopi</h1>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="font-bold block mb-1">Judul Ajakan</label>
            <input 
              required 
              className="w-full p-2.5 border rounded-xl outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Topik</label>
              <input 
                required 
                className="w-full p-2.5 border rounded-xl outline-none"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Maks. Peserta</label>
              <input 
                type="number"
                min="2"
                max="10"
                className="w-full p-2.5 border rounded-xl outline-none"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Tanggal</label>
              <input 
                type="date"
                required 
                className="w-full p-2.5 border rounded-xl outline-none"
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Waktu</label>
              <input 
                type="time"
                required 
                className="w-full p-2.5 border rounded-xl outline-none"
                value={formData.meeting_time}
                onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Deskripsi</label>
            <textarea 
              rows={3} 
              className="w-full p-2.5 border rounded-xl outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl disabled:opacity-50 transition"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}