import { createClient } from '@/lib/supabase/server';
import CoffeeShopExplorer from '@/components/CoffeeShopExplorer';
import { Coffee } from 'lucide-react';

export const revalidate = 0;

export default async function CoffeeShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const supabase = await createClient();

  // Ambil semua coffee shop berstatus approved
  const { data: shops } = await supabase
    .from('coffee_shops')
    .select('*')
    .eq('status', 'approved')
    .order('is_verified', { ascending: false });

  const allCoffeeShops = shops || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C98B5B]/15 text-[#5C3A21]">
          <Coffee className="w-3.5 h-3.5 text-[#C98B5B]" /> Direktori Terkurasi
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1B12]">
          Eksplorasi Coffee Shop di Kotamu
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Daftar coffee shop otomatis menyesuaikan dengan area peta dan kota yang Anda pilih.
        </p>
      </div>

      <CoffeeShopExplorer allCoffeeShops={allCoffeeShops} initialCity={city || ''} />
    </div>
  );
}