import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NgopiCard from '@/components/NgopiCard';
import { PlusCircle } from 'lucide-react';

export const revalidate = 0;

export default async function NgopiFeedPage() {
  const supabase = await createClient();
  const { data: invitations } = await supabase
    .from('ngopi_invitations')
    .select('*, coffee_shops(*)')
    .order('created_at', { ascending: false });

  const list = invitations || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Siapa yang mau ngopi bareng?</h1>
          <p className="text-xs sm:text-sm text-gray-500">Temukan teman ngobrol atau partner WFC.</p>
        </div>
        <Link 
          href="/ngopi/create"
          className="px-4 py-2 bg-accent text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Buat Ajakan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((inv) => (
          <NgopiCard key={inv.id} invitation={inv} />
        ))}
      </div>
    </div>
  );
}