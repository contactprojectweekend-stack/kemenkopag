'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import {
  Search,
  LocateFixed,
  Loader2,
  Navigation,
  MapPin,
  X,
  Tag,
  Coffee,
} from 'lucide-react';

// ==========================================
// 1. KOMPONEN SVG INSTAGRAM MANDIRI
// ==========================================
function InstagramIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// ==========================================
// 2. CUSTOM COFFEE PIN ICON (Cangkir Kopi Kemenkopag)
// ==========================================
function createCoffeeIcon(isVerified: boolean = false) {
  return L.divIcon({
    className: 'custom-coffee-pin',
    html: `
      <div style="position: relative; width: 42px; height: 48px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          width: 38px; 
          height: 38px; 
          background: linear-gradient(135deg, #5C3A21 0%, #2B1B12 100%); 
          border-radius: 50%; 
          border: 2.5px solid #FFFFFF; 
          box-shadow: 0 4px 14px rgba(43, 27, 18, 0.4); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: transform 0.2s ease;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C98B5B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
            <line x1="6" y1="2" x2="6" y2="4"/>
            <line x1="10" y1="2" x2="10" y2="4"/>
            <line x1="14" y1="2" x2="14" y2="4"/>
          </svg>

          ${
            isVerified
              ? `<div style="
                  position: absolute; 
                  top: -2px; 
                  right: -2px; 
                  width: 13px; 
                  height: 13px; 
                  background-color: #5D8A66; 
                  border: 1.5px solid #FFFFFF; 
                  border-radius: 50%;
                "></div>`
              : ''
          }
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent; 
          border-right: 6px solid transparent; 
          border-top: 8px solid #2B1B12; 
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [42, 48],
    iconAnchor: [21, 46],
    popupAnchor: [0, -42],
  });
}

// Pin Lokasi GPS Pengguna (Biru Berdenyut)
const userLocationIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 30px; height: 30px; background-color: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 18px; height: 18px; background-color: #2563EB; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Pin Pencarian Manual (Merah)
const searchTargetIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Controller Animasi Pan & Zoom Peta
function MapFlyController({ targetCoords }: { targetCoords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 13, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
}

// Hitung Jarak (Haversine Formula) dalam KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
}

// Helper Format Instagram
function parseInstagram(ig?: string | null): { url: string; handle: string } | null {
  if (!ig || !ig.trim()) return null;
  const clean = ig.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const urlObj = new URL(clean);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const handle = pathParts[0] || clean;
      return { url: clean, handle: `@${handle.replace('@', '')}` };
    } catch {
      return { url: clean, handle: clean };
    }
  }
  const username = clean.replace(/^@/, '');
  return {
    url: `https://instagram.com/${username}`,
    handle: `@${username}`,
  };
}

interface MapProps {
  coffeeShops: Array<{
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    price_range?: string;
    is_verified?: boolean;
    cover_image?: string;
    instagram?: string;
  }>;
  initialCenter?: [number, number];
  onLocationChange?: (coords: [number, number]) => void;
}

export default function MapComponent({
  coffeeShops,
  initialCenter = [-7.2575, 112.7521],
  onLocationChange,
}: MapProps) {
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(initialCenter);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchPin, setSearchPin] = useState<{ coords: [number, number]; label: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  useEffect(() => {
    if (initialCenter) {
      setMapTarget(initialCenter);
    }
  }, [initialCenter[0], initialCenter[1]]);

  // 1. Ambil Titik GPS Pengguna
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi GPS.');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setMapTarget(coords);
        setIsGpsLoading(false);
        onLocationChange?.(coords);
      },
      (error) => {
        setIsGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Izin lokasi ditolak. Aktifkan GPS pada browser untuk melihat coffee shop terdekat.');
        } else {
          alert('Gagal mengambil titik lokasi GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 2. Pencarian Manual di Peta
  const handleSearchManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const localMatches = coffeeShops
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
        .map((c) => ({
          display_name: `${c.name} — ${c.address}, ${c.city}`,
          lat: c.latitude.toString(),
          lon: c.longitude.toString(),
          isCafe: true,
        }));

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=4`
      );
      const data = await res.json();
      const osmMatches = data.map((d: any) => ({ ...d, isCafe: false }));

      const combined = [...localMatches, ...osmMatches];
      setSearchResults(combined);

      if (combined.length === 0) {
        alert(`Lokasi "${searchQuery}" tidak ditemukan.`);
      }
    } catch {
      alert('Gagal melakukan pencarian peta.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    setMapTarget(coords);
    setSearchPin({
      coords,
      label: result.display_name,
    });
    setSearchResults([]);
    onLocationChange?.(coords);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden border border-[#F7F1E8] shadow-sm">
      {/* Search Bar Mengambang di Atas Peta */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-1 max-w-xs sm:max-w-sm">
        <form onSubmit={handleSearchManual} className="relative flex items-center">
          <input
            type="text"
            placeholder="Cari area atau café di peta..."
            className="w-full pl-9 pr-16 py-2 bg-white/95 backdrop-blur-md rounded-2xl text-xs border border-gray-200 shadow-md outline-none focus:border-[#5C3A21] text-[#2B1B12]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-12 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 px-2.5 py-1 bg-[#5C3A21] hover:bg-[#432A18] text-white rounded-xl text-[10px] font-bold transition"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {/* Dropdown Hasil Pencarian Manual */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden divide-y divide-gray-100 max-h-52 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full p-2.5 text-left text-[11px] text-gray-700 hover:bg-[#F7F1E8] flex items-start gap-2 transition"
              >
                {item.isCafe ? (
                  <Coffee className="w-3.5 h-3.5 text-[#5C3A21] shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-[#C98B5B] shrink-0 mt-0.5" />
                )}
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tombol Melayang "GPS Lokasi Saya" */}
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={isGpsLoading}
        title="Gunakan Lokasi GPS Saya"
        className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md hover:bg-white text-[#5C3A21] border border-[#F7F1E8] px-3.5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold transition hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        {isGpsLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C98B5B]" />
        ) : (
          <LocateFixed className="w-4 h-4 text-emerald-600" />
        )}
        <span className="hidden sm:inline">Lokasi Saya</span>
      </button>

      {/* Peta Leaflet */}
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyController targetCoords={mapTarget} />

        {/* Pin Pencarian Manual */}
        {searchPin && (
          <Marker position={searchPin.coords} icon={searchTargetIcon}>
            <Popup>
              <div className="p-1 space-y-0.5">
                <p className="text-[10px] font-bold text-red-600 uppercase">Titik Pencarian</p>
                <p className="text-xs text-gray-700">{searchPin.label}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pin Lokasi GPS Pengguna */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 space-y-0.5">
                <p className="text-xs font-bold text-blue-700">📍 Lokasi Anda (GPS)</p>
                <p className="text-[10px] text-gray-500">Kamera peta berpusat pada posisi Anda.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pin Coffee Shop */}
        {coffeeShops.map((shop) => {
          const distanceText = userLocation
            ? calculateDistance(userLocation[0], userLocation[1], shop.latitude, shop.longitude)
            : null;
          const igData = parseInstagram(shop.instagram);

          return (
            <Marker
              key={shop.id}
              position={[shop.latitude, shop.longitude]}
              icon={createCoffeeIcon(shop.is_verified)}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[185px]">
                  {shop.cover_image && (
                    <div className="w-full h-20 rounded-xl overflow-hidden bg-gray-100 mb-1">
                      <img
                        src={shop.cover_image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xs text-[#2B1B12] flex items-center gap-1">
                      {shop.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{shop.address}</p>
                  </div>

                  {/* Rentang Harga & Instagram Link */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1 font-bold text-[#5C3A21]">
                      <Tag className="w-3 h-3 text-[#C98B5B]" />
                      <span>{shop.price_range || 'Rp 20.000 - Rp 45.000'}</span>
                    </div>

                    {igData && (
                      <a
                        href={igData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-600 font-bold hover:underline"
                        title={`Buka Instagram ${shop.name}`}
                      >
                        <InstagramIcon className="w-3 h-3 text-pink-500 shrink-0" />
                        <span>{igData.handle}</span>
                      </a>
                    )}
                  </div>

                  {distanceText && (
                    <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      🚗 ± {distanceText} dari lokasi Anda
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
                    <Link
                      href={`/coffee-shops/${shop.slug}`}
                      className="text-[10px] text-[#C98B5B] hover:underline font-bold"
                    >
                      Detail
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition ml-auto"
                    >
                      <Navigation className="w-2.5 h-2.5" /> Rute
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}