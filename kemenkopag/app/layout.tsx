import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Kemenkopag — Teman untuk Ngopi Bareng',
  description: 'Jelajahi coffee shop terkurasi dan temukan teman baru untuk ngopi bareng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-coffeeBg text-primary-dark min-h-screen">
        <Navbar />
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}