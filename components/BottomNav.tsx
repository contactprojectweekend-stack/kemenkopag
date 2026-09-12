'use client';
import Link from 'next/link';
import { Home, Coffee, Users, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F7F1E8] py-2 px-4 flex justify-around items-center">
      <Link href="/" className="flex flex-col items-center text-[10px] text-gray-600 hover:text-primary">
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>
      <Link href="/coffee-shops" className="flex flex-col items-center text-[10px] text-gray-600 hover:text-primary">
        <Coffee className="w-5 h-5" />
        <span>Jelajah</span>
      </Link>
      <Link href="/ngopi" className="flex flex-col items-center text-[10px] font-bold text-accent">
        <Users className="w-5 h-5" />
        <span>Ngopi</span>
      </Link>
      <Link href="/login" className="flex flex-col items-center text-[10px] text-gray-600 hover:text-primary">
        <User className="w-5 h-5" />
        <span>Akun</span>
      </Link>
    </nav>
  );
}