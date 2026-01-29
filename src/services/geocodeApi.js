export async function geocodeLocation(place) {
  if (!place) return null;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
    {
      headers: {
        "Accept": "application/json",
        // REQUIRED by Nominatim usage policy
        "User-Agent": "Panikkaran-App",
      },
    }
  );

  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
  };
}
