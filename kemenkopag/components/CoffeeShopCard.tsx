import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function CoffeeShopCard({ shop }: { shop: any }) {
  return (
    <div className="bg-white rounded-2xl border border-cream overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[16/10] bg-gray-100">
        <img 
          src={shop.cover_image || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'} 
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-xs font-bold text-primary">
          {shop.price_range}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs text-accent font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>{shop.city}</span>
        </div>
        <h3 className="font-bold text-base text-primary-dark">{shop.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{shop.address}</p>
        <Link 
          href={`/coffee-shops/${shop.slug}`}
          className="inline-block w-full mt-2 py-2 text-center bg-cream hover:bg-[#ebdcc8] text-primary text-xs font-bold rounded-xl transition"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}