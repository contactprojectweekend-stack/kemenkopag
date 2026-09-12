'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Check, X, Coffee, Users, RefreshCw } from 'lucide-react';
// Menggunakan client browser Supabase
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [coffeeShops, setCoffeeShops] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  // Fungsi untuk memuat data dari Supabase
  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Periksa apakah role pengguna adalah admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // Ambil data café dan ajakan ngopi bareng
    const [shopsRes, ngopiRes] = await Promise.all([
      supabase.from('coffee_shops').select('*').order('created_at', { ascending: false }),
      supabase.from('ngopi_invitations').select('*, coffee_shops(name), profiles:creator_id(username, full_name)').order('created_at', { ascending: false }),
    ]);

    setCoffeeShops(shopsRes.data || []);
    setInvitations(ngopiRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Aksi: Ganti Status Café (Approve / Pending)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const isVerified = newStatus === 'approved';

    const { error } = await supabase
      .from('coffee_shops')
      .update({ status: newStatus, is_verified: isVerified })
      .eq('id', id);

    if (error) {
      alert('Gagal mengubah status: ' + error.message);
    } else {
      loadData();
    }
  };

  // Aksi: Hapus Coffee Shop
  const handleDeleteCoffeeShop = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return;

    const { error } = await supabase.from('coffee_shops').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      setCoffeeShops((prev) => prev.filter((shop) => shop.id !== id));
      alert(`"${name}" berhasil dihapus.`);
    }
  };

  // Aksi: Hapus Ajakan Ngopi
  const handleDeleteInvitation = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus ajakan ngopi "${title}"?`)) return;

    const { error } = await supabase.from('ngopi_invitations').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
    } else {
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      alert(`Ajakan "${title}" berhasil dihapus.`);
    }
  };

  // Tampilan Loading
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-accent" />
        <span>Memuat data Admin...</span>
      </div>
    );
  }

  // Tampilan Jika Bukan Admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-3xl border border-red-200 text-center space-y-3 shadow-sm">
        <p className="text-red-600 font-bold">Akses Khusus Admin!</p>
        <p className="text-xs text-gray-500">Silakan login menggunakan akun juspisang@kemenkopag.id</p>
        <Link href="/login" className="inline-block px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">
          Menuju Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-12">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F7F1E8] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark">Admin Control Center</h1>
          <p className="text-xs sm:text-sm text-gray-500">Kelola direktori coffee shop dan moderasi ajakan ngopi bareng.</p>
        </div>
        <Link 
          href="/admin/coffee-shops/new"
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Coffee Shop Baru
        </Link>
      </div>

      {/* SECTION 1: KELOLA COFFEE SHOP */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-primary-dark">Daftar Coffee Shop ({coffeeShops.length})</h2>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-[#F7F1E8] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F1E8]/60 text-primary-dark border-b border-[#F7F1E8]">
              <tr>
                <th className="p-3.5">Nama & Kota</th>
                <th className="p-3.5">Alamat</th>
                <th className="p-3.5">Harga</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F1E8]">
              {coffeeShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3.5 font-bold text-primary-dark">
                    {shop.name}
                    <span className="block text-[10px] text-gray-400 font-normal">{shop.city}</span>
                  </td>
                  <td className="p-3.5 text-gray-500 max-w-xs truncate">{shop.address}</td>
                  <td className="p-3.5 font-semibold text-primary">{shop.price_range}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      shop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {/* Tombol Toggle Approve / Pending */}
                      <button 
                        onClick={() => handleToggleStatus(shop.id, shop.status)}
                        title={shop.status === 'approved' ? 'Ubah ke Pending' : 'Approve'}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
                      >
                        {shop.status === 'approved' ? <X className="w-3.5 h-3.5 text-amber-600" /> : <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      {/* Tombol Edit */}
                      <Link 
                        href={`/admin/coffee-shops/${shop.id}/edit`}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-blue-600 transition"
                        title="Edit Data"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {/* Tombol Hapus */}
                      <button 
                        onClick={() => handleDeleteCoffeeShop(shop.id, shop.name)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-rose-600 transition" 
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: MODERASI NGOPI BARENG */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-primary-dark">Moderasi Ngopi Bareng ({invitations.length})</h2>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-[#F7F1E8] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F1E8]/60 text-primary-dark border-b border-[#F7F1E8]">
              <tr>
                <th className="p-3.5">Judul Ajakan</th>
                <th className="p-3.5">Lokasi Café</th>
                <th className="p-3.5">Jadwal</th>
                <th className="p-3.5">Pembuat</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F1E8]">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3.5 font-bold text-primary-dark max-w-xs truncate">
                    {inv.title}
                    <span className="block text-[10px] text-gray-400 font-normal">{inv.topic}</span>
                  </td>
                  <td className="p-3.5 text-gray-600">{inv.coffee_shops?.name || 'Spot Custom'}</td>
                  <td className="p-3.5 text-gray-500 whitespace-nowrap">{inv.meeting_date} ({inv.meeting_time})</td>
                  <td className="p-3.5 text-gray-500">@{inv.profiles?.username || 'user'}</td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {/* Tombol Edit Ajakan */}
                      <Link 
                        href={`/admin/ngopi/${inv.id}/edit`}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-blue-600 transition"
                        title="Edit Ajakan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {/* Tombol Hapus Ajakan */}
                      <button 
                        onClick={() => handleDeleteInvitation(inv.id, inv.title)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-rose-600 transition" 
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}