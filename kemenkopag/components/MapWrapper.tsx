'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Di sini 'ssr: false' diizinkan karena file ini adalah Client Component ('use client')
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-3xl bg-[#F7F1E8]/50 border border-[#F7F1E8] flex flex-col items-center justify-center gap-2 text-xs text-gray-400 shadow-sm">
      <Loader2 className="w-6 h-6 animate-spin text-[#C98B5B]" />
      <span>Menyiapkan peta interaktif...</span>
    </div>
  ),
});

export default function MapWrapper(props: any) {
  return <MapComponent {...props} />;
}