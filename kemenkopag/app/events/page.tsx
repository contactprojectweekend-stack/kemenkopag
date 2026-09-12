import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const revalidate = 0;

export default async function EventsPage() {
  // PENTING: Wajib pakai kata 'await' sebelum createClient()
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  const list = events || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-dark">Event & Aktivitas Kopi</h1>
        <p className="text-xs sm:text-sm text-gray-500">Workshop, kompetisi cupping, dan kumpul komunitas.</p>
      </div>

      {list.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-cream">
          <p className="text-sm text-gray-500">Belum ada event yang terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((ev) => (
            <div key={ev.id} className="bg-white rounded-3xl border border-cream overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="aspect-[16/9] bg-gray-100 relative">
                <img 
                  src={ev.image_url || 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80'} 
                  alt={ev.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl text-xs font-bold text-primary">
                  {ev.price > 0 ? `Rp ${Number(ev.price).toLocaleString('id-ID')}` : 'Gratis'}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-primary-dark">{ev.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{ev.description}</p>
                <div className="pt-2 text-xs text-gray-500 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>{ev.location_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ev.event_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.event_time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}