/**
 * Mengubah input instagram (misal: "@kopitagram", "kopitagram", atau link lengkap)
 * menjadi URL yang bisa diklik dan username yang rapi untuk ditampilkan.
 */
export function formatInstagram(input?: string | null): { url: string; handle: string } | null {
  if (!input || !input.trim()) return null;

  let clean = input.trim();

  // Jika berupa URL lengkap
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const urlObj = new URL(clean);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const handle = pathParts[0] || clean;
      return {
        url: clean,
        handle: `@${handle.replace('@', '')}`,
      };
    } catch {
      return { url: clean, handle: clean };
    }
  }

  // Jika berupa username (@nama atau nama)
  const username = clean.replace(/^@/, '');
  return {
    url: `https://instagram.com/${username}`,
    handle: `@${username}`,
  };
}