'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Otomatis ubah kata 'admin' menjadi email resminya
    const cleanInput = emailOrUsername.trim();
    const loginEmail = cleanInput === 'admin' ? 'admin@kemenkopag.id' : cleanInput;

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email: loginEmail,
        password: password,
        options: {
          data: {
            full_name: fullName,
            username: loginEmail.split('@')[0],
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        alert('Pendaftaran berhasil! Silakan langsung login.');
        setIsRegister(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        // Tampilkan pesan error asli dari Supabase
        setErrorMsg(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-cream shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary text-accent rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {isRegister ? 'Daftar Akun' : 'Masuk ke Kemenkopag'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isRegister ? 'Gabung komunitas kopi' : 'Masuk dengan akun admin atau email Anda'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {isRegister && (
            <div>
              <label className="block font-bold text-primary-dark mb-1">Nama Lengkap</label>
              <input
                required
                type="text"
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-primary-dark mb-1">
              {isRegister ? 'Email' : 'Email atau Username'}
            </label>
            <input
              required
              type={isRegister ? 'email' : 'text'}
              placeholder={isRegister ? 'nama@email.com' : 'Ketik "admin"'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-primary-dark mb-1">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:opacity-90 text-white rounded-xl font-bold shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-500">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="ml-1 text-accent font-bold underline cursor-pointer"
          >
            {isRegister ? 'Masuk di sini' : 'Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
}