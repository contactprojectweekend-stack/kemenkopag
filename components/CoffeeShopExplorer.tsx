'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Coffee,
  RotateCcw,
  Loader2,
  Navigation,
  Tag,
  Crosshair,
} from 'lucide-react';
import CoffeeShopCard from '@/components/CoffeeShopCard';

// Load MapComponent secara dinamis khusus di sisi browser
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-3xl bg-[#F7F1E8]/50 border border-[#F7F1E8] flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin text-[#C98B5B]" />
      <span>Menyiapkan peta interaktif...</span>
    </div>
  ),
});

// Rumus Jarak Bumi (Haversine Formula) dalam Satuan KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return R * c;
}

const POPULAR_CITIES: Record<string, [number, number]> = {
  Surabaya: [-7.2575, 112.7521],
  Sidoarjo: [-7.4478, 112.7183],
  Malang: [-7.9797, 112.6304],
  Jakarta: [-6.2088, 106.8456],
  Bandung: [-6.9175, 107.6191],
  Yogyakarta: [-7.7956, 110.3695],
};

export default function CoffeeShopExplorer({
  allCoffeeShops,
  initialCity = '',
}: {
  allCoffeeShops: any[];
  initialCity?: string;
}) {
  // Titik fokus peta saat ini (default: kota terpilih atau Surabaya)
  const [activeCenter, setActiveCenter] = useState<[number, number]>(
    initialCity && POPULAR_CITIES[initialCity]
      ? POPULAR_CITIES[initialCity]
      : [-7.2575, 112.7521]
  );

  // Radius maksimal (km) coffee shop yang dianggap berada di area sekitar (default: 25 km)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(25);

  // State pencarian & auto-suggestions
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika user klik di luar kotak
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce Autocomplete: gabungan nama kafe internal + nama jalan/kota dari OpenStreetMap
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        // 1. Cari kafe yang namanya cocok dari database
        const localMatches = allCoffeeShops
          .filter(
            (shop) =>
              shop.name.toLowerCase().includes(query.toLowerCase()) ||
              shop.address.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3)
          .map((shop) => ({
            type: 'cafe',
            title: shop.name,
            subtitle: `${shop.address}, ${shop.city}`,
            lat: shop.latitude,
            lon: shop.longitude,
            city: shop.city,
          }));

        // 2. Cari jalan/area dari OpenStreetMap Nominatim Indonesia
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=id&limit=4`
        );
        const osmData = await osmRes.json();
        const osmMatches = osmData.map((item: any) => ({
          type: 'location',
          title: item.display_name.split(',')[0],
          subtitle: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));

        setSuggestions([...localMatches, ...osmMatches]);
        setShowDropdown(true);
      } catch {
        // Abaikan jika network lambat
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, allCoffeeShops]);

  // Handler saat user klik salah satu suggestion
  const handleSelectSuggestion = (item: any) => {
    setQuery(item.title);
    setShowDropdown(false);
    const newCoords: [number, number] = [item.lat, item.lon];
    setActiveCenter(newCoords);

    if (item.city) {
      setSelectedCity(item.city);
    }
  };

  // Filter Coffee Shop: HANYA yang ada di dalam kota terpilih atau radius area sekitar titik peta
  const filteredShops = useMemo(() => {
    return allCoffeeShops
      .map((shop) => {
        const dist = getDistanceKm(
          activeCenter[0],
          activeCenter[1],
          shop.latitude,
          shop.longitude
        );
        return { ...shop, distanceKm: dist };
      })
      .filter((shop) => {
        // Jika filter kota dipilih secara spesifik
        if (selectedCity && selectedCity !== '') {
          return shop.city.toLowerCase().includes(selectedCity.toLowerCase());
        }
        // Jika mode jelajah maps/radius: hanya yang berjarak <= maxRadiusKm dari titik pusat peta
        return shop.distanceKm <= maxRadiusKm;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm); // Urutkan dari yang terdekat
  }, [allCoffeeShops, activeCenter, selectedCity, maxRadiusKm]);

  // Handler ganti kota cepat
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city && POPULAR_CITIES[city]) {
      setActiveCenter(POPULAR_CITIES[city]);
    }
  };

  // Reset semua filter
  const handleReset = () => {
    setQuery('');
    setSelectedCity('');
    setActiveCenter([-7.2575, 112.7521]);
    setMaxRadiusKm(25);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar dengan Autocomplete Dropdown */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#F7F1E8] shadow-sm space-y-3 relative z-30">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input Pencarian dengan Dropdown */}
          <div className="flex-1 relative" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Cari nama café, jalan, atau area sekitar..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#FCFAF7] border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#5C3A21] text-[#2B1B12]"
              />
              {isSearchingSuggestions && (
                <Loader2 className="w-4 h-4 animate-spin text-[#C98B5B] absolute right-3" />
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 max-h-72 overflow-y-auto z-50">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full p-3 text-left hover:bg-[#F7F1E8] flex items-start gap-2.5 transition"
                  >
                    {item.type === 'cafe' ? (
                      <Coffee className="w-4 h-4 text-[#5C3A21] shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-[#C98B5B] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2B1B12] truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                      {item.type === 'cafe' ? 'Coffee Shop' : 'Lokasi Maps'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select Kota */}
          <div className="sm:w-56 relative flex items-center">
            <MapPin className="w-4 h-4 text-[#C98B5B] absolute left-3.5 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#FCFAF7] border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#5C3A21] text-[#2B1B12] font-medium cursor-pointer"
            >
              <option value="">Semua Kota (Radius Sekitar)</option>
              {Object.keys(POPULAR_CITIES).map((c) => (
                <option key={c} value={c}>
                  Kota {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Reset */}
          {(query || selectedCity) && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1 shrink-0"
              title="Reset ke Semua Area"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* Quick Filter Tag Kota Populer */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-semibold shrink-0">Kota Populer:</span>
          <button
            type="button"
            onClick={() => handleCityChange('')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
              !selectedCity
                ? 'bg-[#5C3A21] text-white shadow-sm'
                : 'bg-gray-100 hover:bg-[#F7F1E8] text-gray-600'
            }`}
          >
            Semua Area
          </button>
          {Object.keys(POPULAR_CITIES).map((c) => {
            const isActive = selectedCity.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleCityChange(c)}
                className={`px-3 py-1 rounded-full font-bold transition shrink-0 flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#5C3A21] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-[#F7F1E8] text-gray-600'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isActive ? 'text-[#C98B5B]' : 'text-gray-400'}`} />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Baris Status Area & Jumlah Café */}
      <div className="flex justify-between items-center text-xs text-gray-500 px-1">
        <p>
          Menampilkan{' '}
          <span className="font-bold text-[#2B1B12]">{filteredShops.length} coffee shop</span>{' '}
          {selectedCity ? (
            <span>
              di <span className="font-bold text-[#5C3A21]">Kota {selectedCity}</span>
            </span>
          ) : (
            <span>di sekitar area lokasi peta saat ini (radius &le; {maxRadiusKm} km)</span>
          )}
        </p>
      </div>

      {/* Grid Split: List Café di Kiri, Map di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Kolom Kiri: Daftar Café */}
        <div className="lg:col-span-7 space-y-4">
          {filteredShops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#F7F1E8] p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-[#F7F1E8] rounded-2xl flex items-center justify-center mx-auto text-[#C98B5B]">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#2B1B12]">
                Tidak ada coffee shop di area sekitar ini
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Coba geser peta ke kota lain, perbesar radius, atau pilih kota seperti Surabaya,
                Sidoarjo, atau Malang.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-block mt-2 px-4 py-2 bg-[#5C3A21] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Tampilkan Semua Coffee Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredShops.map((shop) => (
                <div key={shop.id} className="relative">
                  <CoffeeShopCard shop={shop} />
                  {/* Badge Jarak Aktual dari titik pusat maps */}
                  <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-[#5C3A21] border border-gray-100 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5 text-[#C98B5B]" />
                    {shop.distanceKm < 1
                      ? `${Math.round(shop.distanceKm * 1000)} m`
                      : `${shop.distanceKm.toFixed(1)} km`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Peta Interaktif Sinkron */}
        <div className="lg:col-span-5 h-[450px] lg:h-[calc(100vh-200px)] sticky top-20">
          <MapComponent
            coffeeShops={filteredShops}
            initialCenter={activeCenter}
            onLocationChange={(newCoords) => {
              // Jika user tap "Lokasi Saya" (GPS) atau cari di peta, update area café
              setActiveCenter(newCoords);
              setSelectedCity('');
            }}
          />
        </div>
      </div>
    </div>
  );
}