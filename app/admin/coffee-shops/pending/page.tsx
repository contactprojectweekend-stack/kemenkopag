import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function AdminPendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Halaman khusus admin!</div>;
  }

  const { data: pendingShops } = await supabase
    .from('coffee_shops')
    .select('*')
    .eq('status', 'pending');

  async function handleApprove(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const sb = await createClient();
    await sb.from('coffee_shops').update({ status: 'approved', is_verified: true }).eq('id', id);
    revalidatePath('/admin/coffee-shops/pending');
  }

  async function handleReject(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const sb = await createClient();
    await sb.from('coffee_shops').update({ status: 'rejected' }).eq('id', id);
    revalidatePath('/admin/coffee-shops/pending');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-primary-dark">Verifikasi Coffee Shop Baru</h1>
      
      {(!pendingShops || pendingShops.length === 0) ? (
        <p className="text-xs text-gray-500">Tidak ada pengajuan yang menunggu persetujuan.</p>
      ) : (
        <div className="space-y-3">
          {pendingShops.map((shop) => (
            <div key={shop.id} className="bg-white p-4 rounded-2xl border border-cream flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-sm text-primary-dark">{shop.name}</p>
                <p className="text-xs text-gray-500">{shop.city} — {shop.address}</p>
              </div>
              <div className="flex gap-2">
                <form action={handleApprove}>
                  <input type="hidden" name="id" value={shop.id} />
                  <button type="submit" className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition">
                    Approve
                  </button>
                </form>
                <form action={handleReject}>
                  <input type="hidden" name="id" value={shop.id} />
                  <button type="submit" className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}