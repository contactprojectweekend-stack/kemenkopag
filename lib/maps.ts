/**
 * Fungsi untuk mengekstrak latitude dan longitude dari string atau link Google Maps.
 * Mendukung format:
 * - https://www.google.com/maps?q=-7.2575,112.7521
 * - https://www.google.com/maps/@-7.2891,112.7388,17z
 * - https://www.google.com/maps/place/.../@-7.2891,112.7388,15z/...
 * - Nilai koordinat langsung: "-7.2575, 112.7521"
 */
export function extractCoordsFromGoogleMaps(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // 1. Format koordinat langsung: "-7.2575, 112.7521"
  const directMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (directMatch) {
    return {
      lat: parseFloat(directMatch[1]),
      lng: parseFloat(directMatch[3]),
    };
  }

  // 2. Format URL berisi /@lat,lng/
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2]),
    };
  }

  // 3. Format URL parameter query ?q=lat,lng atau ll=lat,lng
  const qMatch = trimmed.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[1]),
      lng: parseFloat(qMatch[2]),
    };
  }

  // 4. Format URL place /!3dlat!4dlng/
  const placeMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (placeMatch) {
    return {
      lat: parseFloat(placeMatch[1]),
      lng: parseFloat(placeMatch[2]),
    };
  }

  return null;
}